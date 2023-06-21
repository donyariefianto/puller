'use strict';
// const { exec } = require('child_process');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const moment = require('moment');
const MongoDb = use("App/Models/MongoDb");
const axios = use('axios');
const Anpr = use("App/Helpers/Anpr");
const fs = require('fs');
const Env = use('Env');
const $HOME = Env.get('PATH_DIR')
let credential_face_recognition = fs.readFileSync($HOME+'public/files/data_user/artemis_face_recognition.json',{encoding:'utf8'});
const ak = JSON.parse(credential_face_recognition).data.app_key;
const sk = JSON.parse(credential_face_recognition).data.secret_key;
const url_artemisFR = JSON.parse(credential_face_recognition).data.base_url;
// AFR artemis face recognition
class ShellScript {

    async afr_getAllTreeCode () {
        const url = `${url_artemisFR}artemis/api/resource/v1/unit/getAllTreeCode`;
        const method = 'POST';
        const sig = Anpr.generateSignature(sk,method,url);
        const curl = `curl --insecure --location --request POST ${url} --header Accept:application/json --header Content-Type:application/json;charset=UTF-8 --header X-Ca-Key:${ak} --header X-Ca-Signature:${sig}`
        const { stdout, stderr } = await exec(curl);
        return JSON.parse(stdout)
    }

    async afr_regions () {
        const url = `${url_artemisFR}artemis/api/resource/v1/regions`;
        const method = 'POST';
        const sig = Anpr.generateSignature(sk,method,url);
        let raw_body = '{"pageNo":1,"pageSize":500}'
        raw_body = (JSON.stringify(raw_body));
        const curl = `curl --insecure --location --request POST ${url} --header Accept:application/json --header Content-Type:application/json;charset=UTF-8 --header X-Ca-Key:${ak} --header X-Ca-Signature:${sig} --data ${raw_body}`
        const { stdout, stderr } = await exec(curl);
        return JSON.parse(stdout)
    }

    async afr_regions_root () {
        const url = `${url_artemisFR}artemis/api/resource/v1/regions/root`;
        const method = 'POST';
        const sig = Anpr.generateSignature(sk,method,url);
        let raw_body = '{"treeCode": "0"}'
        raw_body = (JSON.stringify(raw_body));
        const curl = `curl --insecure --location --request POST ${url} --header Accept:application/json --header Content-Type:application/json;charset=UTF-8 --header X-Ca-Key:${ak} --header X-Ca-Signature:${sig} --data ${raw_body}`
        const { stdout, stderr } = await exec(curl);
        return JSON.parse(stdout)
    }

    async afr_list_of_lower () {
        // Get the List of Lower-Level Organizations with Camera Resources by Organization Code
        const url = `${url_artemisFR}artemis/api/resource/v1/unit/getChildUnitsWithCameraByUnitIndexCode`;
        const method = 'POST';
        console.log('l');
        const sig = Anpr.generateSignature(sk,method,url);
        let raw_body = '{"parentIndexCode":"root00000000","treeCode":"0"}'
        raw_body = (JSON.stringify(raw_body));
        const curl = `curl --insecure --location --request POST ${url} --header Accept:application/json --header Content-Type:application/json;charset=UTF-8 --header X-Ca-Key:${ak} --header X-Ca-Signature:${sig} --data ${raw_body}`
        const { stdout, stderr } = await exec(curl);
        return JSON.parse(stdout)
    }

    async GetDataMonipad () {
        let user = 76, token = 'enygma_fzthgto', id_token = '602';
        //insecure mode
        try {
            const curl = 'curl --insecure --location --request POST https://monipad.dipendajatim.go.id/monipad/index.php/ws/pad/getDataTotal --header Accept:*/* --form user=kominfo --form pass=e4170edb9759b6579dc850a4d38affc68204cf5f5cff724d90f0a921460a9d7b'
            const { stdout, stderr } = await exec(curl);
            var vl = []
            for (const [numb,i] of JSON.parse(stdout).data.pad.entries()) {
                vl.push({
                    "userId":Number(user),
                    "externalDataId":Number(id_token),
                    "externalDataToken":token,
                    "detail":{
                        "Custom_Unique_ID":numb+1,
                        "Data_Date": moment().format('YYYY-MM-DD'),
                        "Label":i.LABEL,
                        "SKT":i.SKT,
                        "Sisa_Hari":JSON.parse(stdout).data.sisahari,
                        "Target":Number(i.TARGET),
                        "Hari_Lalu":Number(i.HARILALU),
                        "Pro_Hari_Lalu":Number(i.PRO_HARILALU),
                        "Jumlah":Number(i.JUMLAH),
                        "Pro":Number(i.PROSEN),
                        "Hari_Ini":Number(i.HRINI),
                        "Pro_Hari_Ini":Number(i.PROHRINI),
                        "Kurang":Number(i.KURANG),
                        "Pro_Kurang":Number(i.PROKURANG),
                        "Icon_Dev":i.KURANG > 0 ? 'minus-circle' : 'plus-circle',
                        "Color_Dev":i.KURANG > 0 ? 'red' : 'green',
                        "Deviasi":i.JUMLAH - i.TARGET,
                        "Icon_pro_dev":'percentage',
                        "Color_Pro_Dev":i.KURANG > 0 ? 'red' : 'green',
                        "Pro_Dev":Number((i.JUMLAH / i.TARGET * 100).toFixed(2)),
                        },
                    created_at : new Date(), 
                    updated_at : new Date(), 
                    deleted_at : null
                })
            }
            await MongoDb.DeleteByToken('enygma_fzthgto',76)
            await MongoDb.MultipleInsert(vl)
            return 'Successfully'
        } catch (error) {
            return error.message
        }
        
    }

    async GetKaiRoute () {
        // x,y to lon,lat
        var meters2degress = function(x,y) {
            var lon = x *  180 / 20037508.34 ;
            //thanks magichim @ github for the correction
            var lat = Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI - 90; 
            return [lon, lat]
        }
        // lon,lat to x,y
        var degrees2meters = function(lon,lat) {
            var x = lon * 20037508.34 / 180;
            var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            y = y * 20037508.34 / 180;
            return [x, y]
        }

        var config = {
            method: 'get',
            url: 'https://www.arcgis.com/sharing/rest/content/items/d21eded5705f4a759e2a64a96594c68b/data?f=json',
            headers: { }
        };
      
      const a = await axios(config);
      var has = []
        for (const i of a.data.operationalLayers) {
        has.push(i.featureCollection.layers[0].featureSet.features)
        }
      var it1=[],it2=[],it3=[]
        for (const i of has[0]) {
            for (const i2 of i.geometry.paths) {
                for (const i3 of i2) {
                    it3.push(meters2degress(i3[0],i3[1]));
                }
                it2.push(it3);
                it3=[]
            }
            i.attributes.id = i.attributes.FID
            it1.push({
                "type": "Feature",
                "geometry": {
                    "type": "MultiLineString",
                    "coordinates": it2
                },
                "properties": i.attributes
            });
            it2=[]
        }
      var point_station = []
      for (const i of has[1]) {
        let temp = meters2degress(i.geometry.x,i.geometry.y)
        i.attributes.Location = `${temp[1]},${temp[0]}`
        point_station.push(i.attributes)
      }
      const result = {
        "type": "FeatureCollection",
        "subject": "Jaringan Rel KAI",
        "features": it1
      }
      return result
      return point_station
    }

}

module.exports = new ShellScript();