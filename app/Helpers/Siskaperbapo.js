'use strict'
const Env = use('Env')
const Database = use("Database");
const axios = use('axios');
const fs = require('fs');
const moment = require('moment');
const $HOME = Env.get('PATH_DIR')
class Siskaperbapo {
    async GenerateSiskaperbapo (komoditas) {
        try {
            var id_komoditas = ["39","49","2","4","3","73","74","71","72","48","38","37","50","13","14","12","27","28","82","7","40","58","62","59","60","61","35","25","41","32","33","42","67","45","43","44","9","92","51","10","95","96","97","81","76","77","78","79","80","68","84","85","86","87","88","91","93","54","89","55","90","23","24","20","21","17","16","30","46","69","47"]
            if (!id_komoditas.includes(komoditas)) {
                return {status:400,message:`Komoditas are allowed ${id_komoditas}`}
            }
            var loopjtm =[{kota:'surabayakota',bps:3578},{kota:'malangkota',bps:3573},{kota:'kedirikota',bps:3571},{kota:'jemberkab',bps:3509},{kota:'bangkalankab',bps:3526},{kota:'banyuwangikab',bps:3510},{kota:'blitarkab',bps:3505},{kota:'bojonegorokab',bps:3522},{kota:'bondowosokab',bps:3511},{kota:'gresikkab',bps:3525},{kota:'jombangkab',bps:3517},{kota:'kedirikab',bps:3506},{kota:'lamongankab',bps:3524},{kota:'lumajangkab',bps:3508},{kota:'madiunkab',bps:3519},{kota:'magetankab',bps:3520},{kota:'malangkab',bps:3507},{kota:'mojokertokab',bps:3516},{kota:'nganjukkab',bps:3518},{kota:'ngawikab',bps:3521},{kota:'pacitankab',bps:3501},{kota:'pamekasankab',bps:3528},{kota:'pasuruankab',bps:3514},{kota:'ponorogokab',bps:3502},{kota:'probolinggokab',bps:3513},{kota:'sampangkab',bps:3527},{kota:'sidoarjokab',bps:3515},{kota:'situbondokab',bps:3512},{kota:'sumenepkab',bps:3529},{kota:'trenggalekkab',bps:3503},{kota:'tubankab',bps:3523},{kota:'tulungagungkab',bps:3504},{kota:'batukota',bps:3579},{kota:'blitarkota',bps:3572},{kota:'madiunkota',bps:3577},{kota:'mojokertokota',bps:3576},{kota:'pasuruankota',bps:3575},{kota:'probolinggokota',bps:3574}]
            var exist = await getAllCities('JAWA TIMUR');
            var hasil = []
            let day5 = []
            let vlnm = []
            for (var i = 0; i < 5; i++) {
                day5.push(await getDataSiska(i))
                vlnm.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
            }
            day5 = day5.reverse();
            vlnm = vlnm.reverse();
            async function getDataSiska(vl){
                let result = await axios({
                    method: 'get',
                    url: `https://siskaperbapo.jatimprov.go.id/home2/getDataMap/?tanggal=${moment().subtract(vl, 'days').format('YYYY-MM-DD')}&komoditas=${komoditas}`,
                    headers: { 
                        'Cookie': 'PHPSESSID=0f0hig2j0sahe9eh6fiev6f89p'
                    }
                });
                result = result.data
                return result;
            }
    
            async function getcolor(trsh10,data){
                let warna
                if(data == 0 ){
                    return warna = 'grey'
                }else if(data <= trsh10 + (trsh10 * 10 / 100) && data >= trsh10 - (trsh10 * 10 / 100) ){
                    return warna = 'green'
                }else if(data >= trsh10 + (trsh10 * 10 / 100)){
                    return warna = 'red'
                }else if(data <= trsh10 - (trsh10 * 10 / 100)){
                    return warna = 'yellow'
                }
            }
    
            for (const a of loopjtm){
                let find = exist.find(o => o.properties.kodebps == a.bps);
                hasil.push({
                    "type": "Feature",
                    "properties": {
                        "id": find.properties.kodebps,
                        "kodebps": find.properties.kodebps,
                        "kemendagri": find.properties.kemendagri,
                        "kabkota": find.properties.kabkota,
                        "provinsi": find.properties.provinsi,
                        "pulau": find.properties.pulau,
                        "negara": find.properties.negara,
                        "luas": find.properties.luas,
                        "keliling": find.properties.keliling,
                        "creator": find.properties.creator,
                        "color": await getcolor(day5[0].avg,day5[0].data[a.kota].hrg),
                        "color2": await getcolor(day5[1].avg,day5[1].data[a.kota].hrg),
                        "color3": await getcolor(day5[2].avg,day5[2].data[a.kota].hrg),
                        "color4": await getcolor(day5[3].avg,day5[3].data[a.kota].hrg),
                        "color5": await getcolor(day5[4].avg,day5[4].data[a.kota].hrg),
                        "value": day5[0].data[a.kota].hrg,
                        "value2": day5[1].data[a.kota].hrg,
                        "value3": day5[2].data[a.kota].hrg,
                        "value4": day5[3].data[a.kota].hrg,
                        "value5": day5[4].data[a.kota].hrg,
                    },
                    "geometry":find.geometry
                });
            }
            const Bahan = {
                "subject": "Bahan Pokok Kabupaten & Kota Jatim",
                "value-name": vlnm,
                "type": "FeatureCollection",
                "name": "Kependudukan Kabupaten Kota Jatim",
                "crs": {
                    "type": "name",
                    "properties": {
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                "features": hasil
            }
            return Bahan
        } catch (e) {
            return {status:400,message:e.message }
        }
    } 
}

module.exports = new Siskaperbapo()