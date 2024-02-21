'use strict'
const Anpr = use("App/Helpers/Anpr")
const FiveMins = use("App/Helpers/FiveMin_Task")
const moment = use("moment")

class AnprController {

    async AnprRecordByTime ({request, response}) {
        let {page_no,page_size,date,id_cam} = request.all();
        if (!date) {
            return response.status(400).json({status:400,message:'Invalid request parameter date'})
        }
        let page = !page_no ? 1 : Number(page_no),skip = 0,
        paging = !page_size ? 10 : Number(page_size),
        start = date + "T00:00:00Z",
        end = date + "T23:59:59Z",
        sort = {'_id':-1}
        if(page == undefined){ page = 1 ,skip = 0}else{skip = (page-1)*paging }
        var count_result = await Anpr.CountAnprRecordByTime(start,end,id_cam)
        var result = await Anpr.GetAnprRecordByTime(start,end,id_cam,skip,paging,sort)
        
        const ress = {
            "status": 200,
            "message": "success",
            datetime:moment().unix(),
            total_items:count_result,
            page_size: paging,
            total_pages:Math.ceil(count_result/paging),
            page_no:Number(page),
            data:result
        }
        return response.json(ress)
    }

    async AnprRecordPicture ({request, response}) {
        let {path} = request.all()
        var data = await Anpr.Vehicle_Picture(path)
        return response.json(data)
    }

    async Anpr5Mins ({response}) {
        await FiveMins.InsertAt5RecordVehicle();
        return response.json({status:200,message:"running 5 mins successfully"})
    }

}

module.exports = AnprController
