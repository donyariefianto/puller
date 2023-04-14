const MongoDb = use("App/Models/MongoDb");
const moment = require('moment');
const axios = require('axios');
const Processing = use("App/Helpers/Processing")
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
                userId:117,
                externalDataToken:'enygma_yqufjoj',
                deleted_at:null
            });
            for (const i of data_cctv_kalimantan) {
                const match = {externalDataToken:i.externalDataToken,deleted_at:null,"detail.Custom_Unique_ID":i.detail.Custom_Unique_ID}
                var tt = await this.getNewUrl(i.detail.Custom_Unique_ID)
                await MongoDb.UpdateOneExternalData(match,{$set:{'detail.Url':tt.data[0]?tt.data[0].cameraStream:'', updated_at : new Date()}});
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    SumArray (arr,key) {
        const sum = arr.reduce((accumulator, object) => {
            return accumulator + Number(object[key]);
        }, 0);
        return sum
    }

    Median(arr,key) {
        let h = arr.map(e=>{
            if (e[key]) {
                return Number(e[key])
            }
        });
        const middle = (h.length + 1) / 2;
        // Avoid mutating when sorting
        const sorted = [...h].sort((a, b) => a - b);
        const isEven = sorted.length % 2 === 0;
      
        return isEven ? (sorted[middle - 1.5]
            + sorted[middle - 0.5]) / 2 :
            sorted[middle - 1];
    }
    
    Min (array,key) {
        let h = array.filter(i=>{
            if (i[key]) {
                return i[key]
            }
        })
        h = h.map(e=>{
            if (e[key]) {
                return Number(e[key])
            }
        });
        return Math.min(...h);
    }

    Max (array,key) {
        let h = array.filter(i=>{
            if (i[key]) {
                return i[key]
            }
        })
        h = h.map(e=>{
            if (e[key]) {
                return Number(e[key])
            }
        });
        return Math.max(...h);
    }

    async Laminetam () {
        let token_dataset = 'enygma_jdldboflne'
        let list_comodity = ["cat-1" ,"cat-2" ,"cat-3" ,"cat-4" ,"cat-5" ,"cat-6" ,"cat-7" ,"cat-8" ,"cat-9" ,"cat-10" ,"cat-11" ,"cat-12" ,"cat-13" ,"cat-14" ,"cat-15" ,"cat-16" ,"cat-17" ,"cat-18" ,"cat-19" ,"cat-20" ,"cat-21" ,"cat-22" ,"cat-23" ,"cat-24" ,"cat-25" ,"cat-26" ,"cat-27"]
        var result = []
        let bps = [{names:'Paser',id:6401},{names:'Kutai Barat',id:6402},{names:'Kutai Kartanegara',id:6403},{names:'Kutai Timur',id:6404},{names:'Berau',id:6405},{names:'Penajam Paser Utara',id:6409},{names:'Mahakam Ulu',id:6411},{names:'Balikpapan',id:6471},{names:'Samarinda',id:6472},{names:'Bontang',id:6474}]
        function gecolor(val,min,max,med){
            if (!val) {
                return '-'
            }
            if (val>=max) {
                return 'maroon'
            }
            if (val<=min) {
                return 'green'
            }
            if (val==med) {
                return 'yellow'
            }
            if (val>med&val<max) {
                return 'red'
            }
            if (val>min&val<med) {
                return 'limegreen'
            }
        }
        for (const i of list_comodity) {
            var temp = await this.getKomoditas(i,moment().format('DD-MM-YYYY'),moment().format('x'));
            let H1 = await this.getKomoditas(i,moment().subtract(1,'day').format('DD-MM-YYYY'),moment().format('x'));
            H1 = H1.tableData
            let H2 = await this.getKomoditas(i,moment().subtract(2,'day').format('DD-MM-YYYY'),moment().format('x'));
            H2 = H2.tableData
            let H3 = await this.getKomoditas(i,moment().subtract(3,'day').format('DD-MM-YYYY'),moment().format('x'));
            H3 = H3.tableData
            let H4 = await this.getKomoditas(i,moment().subtract(4,'day').format('DD-MM-YYYY'),moment().format('x'));
            H4 = H4.tableData
            var temp2 = temp.tableData
            
            var Min_H = this.Min(temp2,'value')
            var Min_H1 = this.Min(H1,'value')
            var Min_H2 = this.Min(H2,'value')
            var Min_H3 = this.Min(H3,'value')
            var Min_H4 = this.Min(H4,'value')
            
            var Max_H = this.Max(temp2,'value')
            var Max_H1 = this.Max(H1,'value')
            var Max_H2 = this.Max(H2,'value')
            var Max_H3 = this.Max(H3,'value')
            var Max_H4 = this.Max(H4,'value')

            var Med_H = this.Median(temp2,'value')
            var Med_H1 = this.Median(H1,'value')
            var Med_H2 = this.Median(H2,'value')
            var Med_H3 = this.Median(H3,'value')
            var Med_H4 = this.Median(H4,'value')

            for (const ii of temp2) {
                let itemp_h1 = H2.find(e=>e.name === ii.name)
                let itemp_h2 = H2.find(e=>e.name === ii.name)
                let itemp_h3 = H3.find(e=>e.name === ii.name)
                let itemp_h4 = H4.find(e=>e.name === ii.name)
                let find_bps = bps.find(e=>e.names === ii.name)
                result.push({
                    Custom_Unique_ID:find_bps?find_bps.id:'-',
                    Category:i,
                    Data_Date:moment().format('YYYY-MM-DD'),
                    Id:temp.commodity,
                    H:ii.value?Number(ii.value):'-',
                    H1:itemp_h1.value?Number(itemp_h1.value):'-',
                    H2:itemp_h2.value?Number(itemp_h2.value):'-',
                    H3:itemp_h3.value?Number(itemp_h3.value):'-',
                    H4:itemp_h4.value?Number(itemp_h4.value):'-',
                    Color:gecolor(ii.value,Min_H,Max_H,Med_H),
                    Color1:gecolor(Number(itemp_h1.value),Min_H1,Max_H1,Med_H1),
                    Color2:gecolor(Number(itemp_h2.value),Min_H2,Max_H2,Med_H2),
                    Color3:gecolor(Number(itemp_h3.value),Min_H3,Max_H3,Med_H3),
                    Color4:gecolor(Number(itemp_h4.value),Min_H4,Max_H4,Med_H4),
                    Kabupaten_Kota:ii.name,
                })
            }
        }
        let data = JSON.stringify({
            "data": result,
            "token": token_dataset,
            "type": "append"
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://senada.kaltimprov.go.id/api/v1/noAuth/multipleinsert',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };
        let res = await axios.request(config)
        return res.data
    }

    async getKomoditas(cat,date,epoch) {
        let headersList = {
            "Accept": "*/*",
        }
        
        let reqOptions = {
        url: `https://hargapangan.laminetam.id/index.php?option=com_gtpihps&view=province_statistics&Itemid=114&commodity_id=${cat}&date=${date}&task=json.getData&_=${epoch}`,
        method: "GET",
        headers: headersList,
        }
        
        let response = await axios.request(reqOptions);
        return response.data
    }
}

module.exports = new Kaltim()