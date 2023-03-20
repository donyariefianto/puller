'use strict'
const Maritim = use("App/Helpers/Maritim");
const Daily = use("App/Helpers/Daily_Task");
const MongoDb = use("App/Models/MongoDb");
const Processing = use("App/Helpers/ShellScript");
const moment = require('moment');
const fs = require('fs');

class ExternalRequestController {
    
    async Testing({ request, response}){
        const a = await Daily.InsertLast2Day();
        return response.json(a)
    }

    async pbb ({request, response}) {
        let {page_no,page_size} = request.all();
        let page = !page_no ? 1 : Number(page_no)
        let paging = !page_size ? 10 : Number(page_size)
        let pbb = fs.readFileSync('public/files/PBB199.json');
        pbb = JSON.parse(pbb);
        var data = pbb
        function paginate(array, page_size, page_number) {
            return array.slice((page_number - 1) * page_size, page_number * page_size);
        }
        return response.json({
            "status": 200,
            "message": "success",
            "datetime": moment().unix(),
            "total_items": data.length,
            "page_size": paging,
            "total_pages": Math.ceil(data.length/paging),
            "page_no": page,
            "data": paginate(data,paging,page)
                    .map(x=> {
                        x.id2 = ((x.nop).replaceAll('.','')).replaceAll('-','')
                        x.nop = ((x.nop).replaceAll('.','')).replaceAll('-','')
                        return x
                    })
        });
    }

    async RemoveAllDataset ({request, response}) {
        let {token,id} = request.all();
        if (!token || !id){
            return response.status(500).json({message: "Invalid id or token"});
        }
        const hapus = await MongoDb.DeleteByToken(token,id)
        response.json(hapus);
    }

    async GetAnpr ({request, response}) {
        const result = await MongoDb.findANPR({
            crossTime:{
                $gte: "2023-03-12T00:00:00+07:00",
                $lt: "2023-03-14T00:00:00+07:00"
            }
        });
        return response.json(result);
    }

    async GetMaritimMeta({request,response}) {
        const result = await Daily.Maritim_Viewboard();
        return response.json(result);
    }

    async GetMaritimViewboard({request,response}){
        const result = await Maritim.viewboard_maritim();
        return response.json(result);
    }

    async GetMaritimArea({request,response}){
        const result = await Maritim.area_maritim();
        return response.json(result);
    }
}

module.exports = ExternalRequestController
