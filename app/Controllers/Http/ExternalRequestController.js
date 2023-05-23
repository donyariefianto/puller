'use strict'
const Maritim = use("App/Helpers/Maritim");
const Daily = use("App/Helpers/Daily_Task");
const Hourly = use("App/Helpers/Hourly_Task");
const kaltim = use("App/Helpers/Kaltim");
const Processing = use("App/Helpers/Processing")
const siskaperbapo = use("App/Helpers/Siskaperbapo");
const MongoDb = use("App/Models/MongoDb");
const ShellScript = use("App/Helpers/ShellScript");
const Anpr = use("App/Helpers/Anpr");
const moment = require('moment');
const fs = require('fs');
const Env = use('Env');
const $HOME = Env.get('PATH_DIR')

class ExternalRequestController {
    
    async Testing({ request, response}){
        let {name,id_cam,id_cam_point} = request.all()
        let a = await Anpr.DeletePrevMonth()
        return response.json(a)
    }

    async GenerateCctvKaltim({ request, response}){
        let {name,id_cam,id_cam_point} = request.all()
        let a = await kaltim.Generate_link_cctv_kaltim()
        return response.json(a)
    }

    async DeleteByUser({ request, response}){
        let {user} = request.all()
        if (!user) {
            return response.api(400, "user is null")
        }
        const hapus = await MongoDb.DeleteByQuery({userId:Number(user)})
        return response.json(hapus)
    }

    async GenerateSiskaperbapo({request, response}){
        let a = await Daily.SiskaperbapoByMetadata()
        return response.json(a)
    }

    async GenerateSiskaperbapoArea({request, response}){
        let {id} = request.all()
        let a = await siskaperbapo.GenerateSiskaperbapoByMeta(id)
        return response.json(a)
    }

    async AllCity ({request,response}) {
        var a = await Processing.getAllCities('JAWA TIMUR');
        return response.json(a)
    }

    async pbb ({request, response}) {
        let {page_no,page_size} = request.all();
        let page = !page_no ? 1 : Number(page_no)
        let paging = !page_size ? 10 : Number(page_size)
        let pbb = fs.readFileSync($HOME+'public/files/PBB199.json');
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

    async KaiRoute ({response}) {
        let res = await ShellScript.GetKaiRoute();
        return response.json(res)
    }

    async RemoveAllDataset ({request, response}) {
        let {token,id} = request.all();
        if (!token || !id){
            return response.status(500).json({message: "Invalid id or token"});
        }
        const hapus = await MongoDb.DeleteByToken(token,id)
        response.json(hapus);
    }

    async UpdateAllDataset ({request, response}) {
        let {token,id,data} = request.all();
        if (!token || !id || !data){
            return response.status(500).json({message: "Invalid id or token"});
        }
        const hapus = await MongoDb.UpdateByToken(token,id,data)
        response.json(hapus);
    }

    async GetAnpr ({request, response}) {
        let {id_cam,id_cam_point,name} = request.all();
        if (!id_cam||!id_cam_point||!name) {
            return response.status(500).json("id_cam, id_cam_point, or name Invalid")
        }
        const now = moment().utcOffset('+0700').format('YYYY-MM-DDTHH:00:00Z');
        const a = await Anpr.Generate_Anpr_Hourly(id_cam,id_cam_point,name,now);
        return response.json(a)
    }

    async GetMaritimMeta({response}) {
        const result = await Daily.Maritim_Meta();
        return response.json(result);
    }

    async GetMaritimViewboard({response}){
        const result = await Daily.Maritim_Viewboard();
        return response.json(result);
    }

    async GetMaritimArea({request,response}){
        const result = await Maritim.area_maritim();
        return response.json(result);
    }

    async list_cam ({request,response}) {
        let a = await Anpr.List_Camera()
        return response.json(a)
    }

    async Vehicle_Record_Overview ({request,response}) {
        let a = await Anpr.Vehicle_Record_Overview()
        return response.json(a)
    }

    async Vehicle_Record ({request,response}) {
        let {cam} = request.all()
        let a = await Anpr.Vehicle_Record(cam)
        return response.json(a)
    }
}

module.exports = ExternalRequestController
