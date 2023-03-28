const MongoDb = use("App/Models/MongoDb");
const moment = require('moment');
const axios = require('axios');

class Kaltim {

    async getNewUrl(id) {
        let headersList = {
         "Accept": "*/*",
         "Content-Type": "application/json" 
        }
        
        let bodyContent = JSON.stringify({
            "full_url": "cctvdishubkaltim.iconpln.co.id:8443",
            "username": "administrator",
            "password": "@dm1nVMS",
            "clientName": "DISHUB-KALTIM",
            "cameraId": id
        });
    
        let reqOptions = {
            url: "http://103.17.142.2:3388/camera",
            method: "POST",
            headers: headersList,
            data: bodyContent,
        }
        let datas = await axios(reqOptions);
        datas = datas.data
        return datas
    }

    async Generate_link_cctv_kaltim () {
        try {
            const data_cctv_kalimantan = await MongoDb.findExternalData({
                userId:93,
                externalDataToken:'enygma_vqywgzdahpo',
                deleted_at:null
            });
            for (const i of data_cctv_kalimantan) {
                const match = {externalDataToken:i.externalDataToken,deleted_at:null,"detail.Custom_Unique_ID":i.detail.Custom_Unique_ID}
                var tt = await this.getNewUrl(i.detail.Custom_Unique_ID)
                await MongoDb.UpdateOneExternalData(match,{$set:{'detail.Url':tt.data[0].cameraStream , updated_at : new Date()}});
            }
        } catch (error) {
            
        }
        
    }
}

module.exports = new Kaltim()