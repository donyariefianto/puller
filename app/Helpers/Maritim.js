'use strict'
const Env = use('Env')
const Database = use("Database");
const axios = use('axios');
const fs = require('fs');
const moment = require('moment');
const $HOME = Env.get('home')
class Maritim {

    async area_maritim (){
        let all_detail_maritim = [], rest = []
        try {
            for (var i = 65; i <= 90; i++) {
                var temp = await this.get_detail(`https://peta-maritim.bmkg.go.id/geojson-update/${String.fromCharCode(i)}.json`);
                if (temp.features) {
                    temp.features.map(x=>{
                        x.properties.id = x.properties.WP_1.replaceAll('.','')
                        return x
                    })
                    all_detail_maritim.push(temp.features)
                }        
            }
            for (const i of all_detail_maritim) {
                for (const i2 of i) {
                    rest.push(i2)
                }
            }
            const result = {"type":"FeatureCollection","features":rest}
            fs.writeFileSync(`public/files/maritim/maritim.json`,JSON.stringify(result));
            return {status:'success',path:`./files/maritim/maritim.json`}
        } catch (error) {
            return {status:'failed',message:error.message}
        }
    }

    async viewboard_maritim () {
        const dir = 'public/files/maritim/'
        const files = fs.readdirSync($HOME+dir);
        var cuaca_detail = [{name:'unknown',en:'question'},{name:'Cerah',en:'sun'},{name:'Cerah Berawan',en:'sun-cloud'},{name:'Berawan',en:'cloud'},{name:'Berawan Tebal',en:'clouds'},{name:'Udara Kabur',en:'smog'},{name:'Asap',en:'smoke'},{name:'Kabut',en:'fog'},{name:'Hujan Ringan',en:'cloud-drizzle'},{name:'Hujan Sedang',en:'cloud-showers'},{name:'Hujan Lebat',en:'cloud-hail-mixed'},{name:'Hujan Lokal',en:'cloud-sleet'},{name:'Hujan Petir',en:'thunderstorm'}]

        var prop = []
        try {
            for (const i of files) {
                let temp = fs.readFileSync(dir+i)
                temp = JSON.parse(temp).features
                if (temp) {           
                    for (const i2 of temp) {
                        var detail_data = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=1`)
                        const ico_weather = cuaca_detail.find(e => e.name.includes(detail_data.cuaca.name?detail_data.cuaca.name:'unknown'));
                        var detail_data2 = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=2`)
                        const ico_weather2 = cuaca_detail.find(e => e.name.includes(detail_data2.cuaca.name?detail_data2.cuaca.name:'unknown'));
                        var detail_data3 = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=3`)
                        const ico_weather3 = cuaca_detail.find(e => e.name.includes(detail_data3.cuaca.name?detail_data3.cuaca.name:'unknown'));
                        var detail_data4 = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=4`)
                        const ico_weather4 = cuaca_detail.find(e => e.name.includes(detail_data4.cuaca.name?detail_data4.cuaca.name:'unknown'));
                        prop.push({
                            Custom_Unique_ID:i2.properties.WP_1.replaceAll('.',''),
                            Nama_Perairan:i2.properties.WP_IMM,
                            Data_Date:moment().format('YYYY-MM-DD'),
                            Gelombang_Minimum:detail_data.gelombang.gelombang_min?detail_data.gelombang.gelombang_min:0,
                            Gelombang_Maximum:detail_data.gelombang.gelombang_max?detail_data.gelombang.gelombang_max:0,
                            Keterangan_Gelombang:`${detail_data.gelombang.name?detail_data.gelombang.name:''} / ${detail_data.gelombang.name_eng?detail_data.gelombang.name_eng:''}`,
                            Angin:`from ${detail_data.angin.from.name?detail_data.angin.from.name:''} to ${detail_data.angin.to.name?detail_data.angin.to.name:''}`,
                            Cuaca:detail_data.cuaca.name?detail_data.cuaca.name:0,
                            Gambar_Cuaca:ico_weather.en,
                            Gambar_Gelombang:'',
                            Nomor_Surat:detail_data.nomor_surat?detail_data.nomor_surat:0,
                            Color_Gambar_Cuaca:'',
                            Color_Gambar_Gelombang:detail_data.gelombang.color?detail_data.gelombang.color:0,
                            Peringatan_Dini:detail_data.cuaca_buruk?detail_data.cuaca_buruk:'',
                            Kondisi_Sinoptik:detail_data.kondisi_cuaca?detail_data.kondisi_cuaca:'',
                            Gelombang_Value:detail_data.gelombang.description?detail_data.gelombang.description:'',
                            Berlaku: detail_data.berlaku?detail_data.berlaku:'',
                            Angin_From:detail_data.angin_from?detail_data.angin_from:'',
                            Angin_To:detail_data.angin_to?detail_data.angin_to:'',
                            Speed_Min:detail_data.speed_min?detail_data.speed_min:0,
                            Speed_Max:detail_data.speed_max?detail_data.speed_max:0,
                        })
                        prop.push({
                            Custom_Unique_ID:i2.properties.WP_1.replaceAll('.',''),
                            Nama_Perairan:i2.properties.WP_IMM,
                            Data_Date:moment().format('YYYY-MM-DD'),
                            Gelombang_Minimum:detail_data2.gelombang.gelombang_min?detail_data2.gelombang.gelombang_min:0,
                            Gelombang_Maximum:detail_data2.gelombang.gelombang_max?detail_data2.gelombang.gelombang_max:0,
                            Keterangan_Gelombang:`${detail_data2.gelombang.name?detail_data2.gelombang.name:''} / ${detail_data2.gelombang.name_eng?detail_data2.gelombang.name_eng:''}`,
                            Angin:`from ${detail_data2.angin.from.name?detail_data2.angin.from.name:''} to ${detail_data2.angin.to.name?detail_data2.angin.to.name:''}`,
                            Cuaca:detail_data2.cuaca.name?detail_data2.cuaca.name:0,
                            Gambar_Cuaca:ico_weather2.en,
                            Gambar_Gelombang:'',
                            Nomor_Surat:detail_data2.nomor_surat?detail_data2.nomor_surat:0,
                            Color_Gambar_Cuaca:'',
                            Color_Gambar_Gelombang:detail_data2.gelombang.color?detail_data2.gelombang.color:0,
                            Peringatan_Dini:detail_data2.cuaca_buruk?detail_data2.cuaca_buruk:'',
                            Kondisi_Sinoptik:detail_data2.kondisi_cuaca?detail_data2.kondisi_cuaca:'',
                            Gelombang_Value:detail_data2.gelombang.description?detail_data2.gelombang.description:'',
                            Berlaku: detail_data2.berlaku?detail_data2.berlaku:'',
                            Angin_From:detail_data2.angin_from?detail_data2.angin_from:'',
                            Angin_To:detail_data2.angin_to?detail_data2.angin_to:'',
                            Speed_Min:detail_data2.speed_min?detail_data2.speed_min:0,
                            Speed_Max:detail_data2.speed_max?detail_data2.speed_max:0,
                        })
                        prop.push({
                            Custom_Unique_ID:i2.properties.WP_1.replaceAll('.',''),
                            Nama_Perairan:i2.properties.WP_IMM,
                            Data_Date:moment().format('YYYY-MM-DD'),
                            Gelombang_Minimum:detail_data3.gelombang.gelombang_min?detail_data3.gelombang.gelombang_min:0,
                            Gelombang_Maximum:detail_data3.gelombang.gelombang_max?detail_data3.gelombang.gelombang_max:0,
                            Keterangan_Gelombang:`${detail_data3.gelombang.name?detail_data3.gelombang.name:''} / ${detail_data3.gelombang.name_eng?detail_data3.gelombang.name_eng:''}`,
                            Angin:`from ${detail_data3.angin.from.name?detail_data3.angin.from.name:''} to ${detail_data3.angin.to.name?detail_data3.angin.to.name:''}`,
                            Cuaca:detail_data3.cuaca.name?detail_data3.cuaca.name:0,
                            Gambar_Cuaca:ico_weather3.en,
                            Gambar_Gelombang:'',
                            Nomor_Surat:detail_data3.nomor_surat?detail_data3.nomor_surat:0,
                            Color_Gambar_Cuaca:'',
                            Color_Gambar_Gelombang:detail_data3.gelombang.color?detail_data3.gelombang.color:0,
                            Peringatan_Dini:detail_data3.cuaca_buruk?detail_data3.cuaca_buruk:'',
                            Kondisi_Sinoptik:detail_data3.kondisi_cuaca?detail_data3.kondisi_cuaca:'',
                            Gelombang_Value:detail_data3.gelombang.description?detail_data3.gelombang.description:'',
                            Berlaku: detail_data3.berlaku?detail_data3.berlaku:'',
                            Angin_From:detail_data3.angin_from?detail_data3.angin_from:'',
                            Angin_To:detail_data3.angin_to?detail_data3.angin_to:'',
                            Speed_Min:detail_data3.speed_min?detail_data3.speed_min:0,
                            Speed_Max:detail_data3.speed_max?detail_data3.speed_max:0,
                        })
                        prop.push({
                            Custom_Unique_ID:i2.properties.WP_1.replaceAll('.',''),
                            Nama_Perairan:i2.properties.WP_IMM,
                            Data_Date:moment().format('YYYY-MM-DD'),
                            Gelombang_Minimum:detail_data4.gelombang.gelombang_min?detail_data4.gelombang.gelombang_min:0,
                            Gelombang_Maximum:detail_data4.gelombang.gelombang_max?detail_data4.gelombang.gelombang_max:0,
                            Keterangan_Gelombang:`${detail_data4.gelombang.name?detail_data4.gelombang.name:''} / ${detail_data4.gelombang.name_eng?detail_data4.gelombang.name_eng:''}`,
                            Angin:`from ${detail_data4.angin.from.name?detail_data4.angin.from.name:''} to ${detail_data4.angin.to.name?detail_data4.angin.to.name:''}`,
                            Cuaca:detail_data4.cuaca.name?detail_data4.cuaca.name:0,
                            Gambar_Cuaca:ico_weather4.en,
                            Gambar_Gelombang:'',
                            Nomor_Surat:detail_data4.nomor_surat?detail_data4.nomor_surat:0,
                            Color_Gambar_Cuaca:'',
                            Color_Gambar_Gelombang:detail_data4.gelombang.color?detail_data4.gelombang.color:0,
                            Peringatan_Dini:detail_data4.cuaca_buruk?detail_data4.cuaca_buruk:'',
                            Kondisi_Sinoptik:detail_data4.kondisi_cuaca?detail_data4.kondisi_cuaca:'',
                            Gelombang_Value:detail_data4.gelombang.description?detail_data4.gelombang.description:'',
                            Berlaku: detail_data4.berlaku?detail_data4.berlaku:'',
                            Angin_From:detail_data4.angin_from?detail_data4.angin_from:'',
                            Angin_To:detail_data4.angin_to?detail_data4.angin_to:'',
                            Speed_Min:detail_data4.speed_min?detail_data4.speed_min:0,
                            Speed_Max:detail_data4.speed_max?detail_data4.speed_max:0,
                        })
                    }
                }
            }
            return prop
        } catch (error) {
            return {status:'failed',message:error.message}
        }
    }

    async meta_maritim () {
        const dir = 'public/files/maritim/'
        const files = fs.readdirSync(dir);
        var prop = []
        for (const i of files) {
            let temp = fs.readFileSync(dir+i)
            temp = JSON.parse(temp).features
            if (temp) {    
                for (const i2 of temp) {
                    var rslt = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=1`);
                    var rslt2 = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=2`);
                    var rslt3 = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=3`);
                    var rslt4 = await this.get_detail(`https://peta-maritim.bmkg.go.id/ajax/bindpopup_pelayanan?kode=${i2.properties.WP_1}&hari=4`);
                    prop.push({
                        Custom_Unique_ID:i2.properties.WP_1.replaceAll('.',''),
                        Nama_Perairan:i2.properties.WP_IMM,
                        Data_Date:moment().format('YYYY-MM-DD'),
                        Value:rslt.gelombang.gelombang_max?rslt.gelombang.gelombang_max:0,
                        Value2:rslt2.gelombang.gelombang_max?rslt2.gelombang.gelombang_max:0,
                        Value3:rslt3.gelombang.gelombang_max?rslt3.gelombang.gelombang_max:0,
                        Value4:rslt4.gelombang.gelombang_max?rslt4.gelombang.gelombang_max:0,
                        Color:rslt.gelombang.color?rslt.gelombang.color:0,
                        Color2:rslt2.gelombang.color?rslt2.gelombang.color:0,
                        Color3:rslt3.gelombang.color?rslt3.gelombang.color:0,
                        Color4:rslt4.gelombang.color?rslt4.gelombang.color:0
                    })
                }
            }
        }
        return prop
    }

    async get_detail (url){
        let headersList = {
            "Accept": "*/*",
           }
           
           let reqOptions = {
             url: url,
             method: "GET",
             headers: headersList,
           }
           
           try {
                var a = await axios.request(reqOptions);
                return  a.data
           } catch (error) {
                return {
                    message: error.message
                }
           }
    }
    
}

module.exports = new Maritim()