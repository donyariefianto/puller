'use strict'
const Env = use('Env')
const Database = use("Database");
const axios = use('axios');
const MongoDb = use("App/Models/MongoDb");
const moment = require('moment');
const token_logs = 'enygma_qhkoaasjr';
var CryptoJS = require("crypto-js");

class Processing {

    async SavePublicDir(bodyContent){
        let headersList = {
            "Accept": "*/*",
            "Content-Type": "application/json" 
        }        
        let reqOptions = {
            // url: "http://10.10.10.81:5001/manage/alprgenerate",
            url: "https://enygma.id/save_file_dir",
            method: "POST",
            headers: headersList,
            data: bodyContent,
        }
        return await axios(reqOptions);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    fromEntries_ (iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
          obj[key] = val
          return obj
        }, {})
    }

    toTitleCase (str) {
        if(str.toLowerCase()=='custom_unique_id')  return "Custom_Unique_ID"
        return str.split('_').join(' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()).split(' ').join('_');
    }

    RenameKeyToLowerCase (obj){
        return obj.map(x => 
            this.fromEntries_(
                Object.entries(x).map(([key, value]) => 
                    [`${key.toLowerCase()}`, value]
                )
            )    
        )
    }

    RenameKeyToTitleCase (obj){
        return obj.map(x => 
            this.fromEntries_(
                Object.entries(x).map(([key, value]) => 
                    [this.toTitleCase(key), value]
                )
            )    
        )
    }

    AddTime(now,time,type) {
        return moment(now).add(time,type).utcOffset('+0700').format()
    }
    
    SubtractTime(now,time,type) {
        return moment(now).subtract(time,type).format()
    }
    
    conv(time){
        return moment(time).unix();
    }
    
    FilterDataByTime(data,start,end){
        // return data.filter(x=>conv(x.crossTime)<=conv(end) && conv(x.crossTime)>=conv(start));
        var temp = []
        for (let i = 0; i < data.length; i++) {
            if (conv(data.crossTime)<=conv(end) && conv(data.crossTime)>=conv(start)) {
                temp.push(data[i])                
            }
        }
        return temp
    }

    closestIndex(num, arr){
        let curr = arr[0], diff = Math.abs(num - curr);
        let index = 0;
        for (let val = 0; val < arr.length; val++) {
           let newdiff = Math.abs(num - arr[val]);
           if (newdiff < diff) {
              diff = newdiff;
              curr = arr[val];
              index = val;
           };
        };
        return index;
    };

    async Get_ExternalDataLayers (token) {
        let res_data = await Database.from('external_data_layers').whereNull('deleted_at').where('token',token).first();
        return {
            user_id:res_data.user_id,
            id:res_data.id,
            token:res_data.token,
        }
    }

    async InsertByToken (datares,dataset,type){
        const data = this.RenameKeyToTitleCase(datares);
        const dataInsert = data.map(detail => {
            return {
                userId: Number(dataset.user_id),
                externalDataId: Number(dataset.id),
                externalDataToken: dataset.token,
                detail: detail,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            }
        });
        if (type=='append') {
            return MongoDb.MultipleInsert(dataInsert);
        } else if(type=='replace') {
            var myquery = {externalDataToken : dataset.token};
            var newvalues = {$set:{deleted_at : new Date()}}
            MongoDb.MultipleInsert(myquery, newvalues);
            return MongoDb.MultipleInsert(dataInsert);
        }
    }

    async Create_Logs (detail,CID,TYPE,t1,t0) {
        let logs = {
            Epoch:moment().unix(),
            Custom_Unique_ID:CID,
            Type:TYPE,
            Data_Date:moment().utcOffset('+0700').format('YYYY-MM-DD'),
            Time:moment().utcOffset('+0700').format('HH:mm:ss'),
            Detail:detail,
            Executed_Time:(t1 - t0)/1000 + " seconds."
        }
        const requirement_insert = await this.Get_ExternalDataLayers(token_logs);
        try {
            await MongoDb.InsertData(requirement_insert.user_id, requirement_insert.id, requirement_insert.token, logs);
            return 'succes create logs ' + moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        } catch (e) {
            return e.message
        }
    }

    async Create_LogsV2 (uid,data_id,log_type,sub_log_type,interval,created_at,message,t1,t0,status) {
        let logs = {
            uid:uid,
            data_id:data_id,
            log_type:log_type,
            sub_log_type:sub_log_type,
            interval:interval,
            excution_time:(Number(t1) - Number(t0))/1000+ " s",
            last_executed:moment().format('YYYY-MM-DDTHH:mm:ssZ'),
            created_at:created_at,
            message:message,
            status:status
        }
        return await MongoDb.InsertLogs(logs);
    }

    async getAllCities(provinsi){
        var cfg = {
            method: 'get',
            url: `https://d2pitp328jxg0o.cloudfront.net/Indonesia/All+Cities/all_cities.json`,
        };
    
        let data = await axios(cfg);
        data = data.data.data
        var dekrip  = CryptoJS.AES.decrypt(data, 'ZW55Z21hSU9Q');
        var originalText = dekrip.toString(CryptoJS.enc.Utf8);
        let result_city = JSON.parse(originalText)
        let province = []
        for (const i of result_city.features) {
            if (i.properties.provinsi == provinsi.toUpperCase()) {
                let check = province.find(e => e.properties.kabkota == i.properties.kabkota);
                if (!check){
                    province.push(i)
                }
            }
        }
        return province
    }

    async SaveStatsDataset(id_user,name_file,data){
        let headersList = {
            "Accept": "*/*",
            "Content-Type": "application/json" 
        }
           
        let bodyContent = {
            "path_dir":`dashboard/${id_user}/`,
            "name":`${name_file}.json`,
            "data":data
        };
        let reqOptions = {
            url: "https://enygma.id/save_file_dir",
            method: "POST",
            headers: headersList,
            data: bodyContent,
        }
        try {
          return await axios(reqOptions);
          
        } catch (error) {
          return error.message
        }      
    }

    async getStatistik(id_user){
        let headersList = {
          "Accept": "*/*",
        }
    
        let reqOptions = {
          url: `https://api.enygma.id/v1/datasets/counts/all?user=${id_user}`,
          method: "GET",
          headers: headersList,
        }
        let res = await axios(reqOptions);
        return res.data
    }

    async UpdateS3File(file,data) {
        let headersList = {
          "Accept": "*/*",
          "Content-Type": "application/json" 
        }
        
        let bodyContent = JSON.stringify({
          "data": data
        });
        
        let reqOptions = {
          url: `https://api.enygma.id/v1/noAuth/updates3file?uploadParams=${file}`,
          method: "POST",
          headers: headersList,
          data: bodyContent,
        }
        return await axios(reqOptions)
    }

    async DeleteFullCollections (Collection) {
        return MongoDb.DeleteFullCollection(Collection);
    }

    async DeleteDataByUser(user){
        return MongoDb.deleteMany({userId:10});
    }
}

module.exports = new Processing()