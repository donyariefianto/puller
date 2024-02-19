'use strict'
const Anpr = use("App/Helpers/Anpr")

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
        var result = await Anpr.GetAnprRecordByTime(start,end,id_cam,skip,paging,sort)
        return response.json(result)
    }

    async AnprRecordPicture ({request, response}) {
        let {path} = request.all()
        var data = await Anpr.Vehicle_Picture(path)
        return response.json(data)
    }

}

module.exports = AnprController
