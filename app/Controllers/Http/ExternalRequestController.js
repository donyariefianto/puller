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
const FiveMin_Task = use("App/Helpers/FiveMin_Task");
const pilihSiapa = use("App/Helpers/PilihSiapa");
const Database = use('Database')
const axios = use('axios');
const { ObjectID } = require('mongodb');
class ExternalRequestController {

    async test ({}) {
        await FiveMin_Task.InsertAt5RecordVehicle()
    }
    

    async SurveyorReport ({request, response}) {
        let {list_token,kecamatan} = request.all()
        if (!list_token) {
            return response.status(400).json({status:400, message:"Request param [list_token] is required"})
        }
        list_token = list_token.split(',')
        let resp = []
        for (const [v,i] of list_token.entries()) {
            var result = {}
            const Data_Mongo = await MongoDb.findExternalData({externalDataToken:i})
            const data_mysql = await Database.connection('mysql').table('external_data_layers').where('token',i)
            const data_selesai_survey = Data_Mongo.filter(e=>{
                if (e.detail.Color === 'green') {
                    return e
                }
            })
            const nama_surveyor = JSON.parse(data_mysql[0].parameter).find(e=> e.parameter == "Nama_Surveyor")
            result.Custom_Unique_ID = v+1
            result.date = moment().format('DD-MM-YYYY')
            result.kelurahan = data_mysql[0].name.split(' ')[data_mysql[0].name.split(' ').length-1]
            result.kecamatan = Data_Mongo[0].detail.Kecamatan
            result.nama_surveyor = nama_surveyor.list
            result.jumlah_nop = Data_Mongo ? Data_Mongo.length : 0
            result.jumlah_nop_selesai_survey = data_selesai_survey ? data_selesai_survey.length : 0
            result.presentase = data_selesai_survey&&Data_Mongo ? (data_selesai_survey.length/Data_Mongo.length * 100).toFixed(2) : 0
            resp.push(result)
        }
        if (kecamatan) {
            resp = resp.filter(e=>e.kecamatan.toLocaleLowerCase() == kecamatan.toLocaleLowerCase())
        }
        return response.json(resp)
    }

    async Logs ({request,view}) {
        return view.render('logs', {})
    }

    async MQTT ({request,view}) {
        return view.render('socket', {})
    }

    async LogStatistik ({params,view}) {
        let data = fs.readFileSync($HOME+'public/files/life-expectancy-table.json',{encoding:'utf8'})        
        return view.render('logs_id', {data:JSON.parse(data)})
    }

    async GetLog ({request,response}) {
        response.header('Access-Control-Allow-Origin', '*')
        let {draw,start,length,order,columns} = request.all()
        const getcolumn = columns
        columns = columns.filter(e=>{
            if(!e.search.value == ''){
                return e
            }
        })
        let query={},or=[],sort = {_id:-1}
        for (const i of columns) {
            switch (i.data) {
                case "uid":
                    query['uid'] = Number(i.search.value)
                    break;
                case "data_id":
                    query[i.data] = Number(i.search.value)
                    break;
                default:
                    const temp = {}
                    temp[i.data] = {$regex:i.search.value}
                    or.push(temp)
                    break;
            }
        }
        if (or[0]) {
            query.$or=or
        }
        if (order) {
            sort = {}
            sort[getcolumn[Number(order[0].column)].data] = order[0].dir == 'asc' ? 1 : -1
        }
        let length_data = await MongoDb.GetLogsLength(query)
        let data =  await MongoDb.GetLogs(query,Number(start),Number(length),sort)
        data = data.map(e=>{
            return {
                uid:e.uid,
                data_id:e.data_id,
                log_type:e.log_type,
                sub_log_type:e.sub_log_type,
                interval:e.interval,
                execution_time:e.excution_time,
                last_executed:e.last_executed,
                created_at:e.created_at,
                message:e.message,
                status:e.status?e.status:false
            }
        })
        return response.json({draw:draw,iTotalRecords:length_data,iTotalDisplayRecords:length_data,aaData:data})
    }

    async DeleteCollection ({request,response}) {
        let {collection} = request.all()
        if (!collection) {
            return response.status(400).json({status:400, message:"collection not found"})
        }
        let result = await Processing.DeleteFullCollections(collection);
        return response.json(result)
    }

    async UpdateByCollection ({request,response}) {
        let {collection} = request.all()
        if (!collection) {
            return response.status(400).json({status:400, message:"collection not found"})
        }
        let result = await Processing.UpdateDataByCollection(collection, query, newvalues);
        return response.json(result)
    }

    async pilihSiapaPoint ({request, response}){
        const data_mysql = await Database.connection('mysql_pilihsiapa').table('users');
        const res = await pilihSiapa.getPilihSiapaPoint()
        var result = []
        for (const i of res) {
            const getUser = data_mysql.find(e=>e.uuid == i.uuid);
            result.push({
                Custom_Unique_ID: getUser.uuid,
                Data_Date: moment().format('YYYY-MM-DD'),
                Title: getUser.name,
                Email:getUser.email,
                Avatar: getUser.avatar,
                Region:i.region,
                Election:i.election,
                Location:i.location,
                Value:0,
                Data_Color:'-',
                Mini_Info:'-',
                Url:'-',
                Address:'-'
            })
        }
        return response.json(result)
    }

    async pilihSiapaAnswer ({request, response}) {
        const res = await pilihSiapa.getPilihSiapaAnswer()
        const data_mysql = await Database.connection('mysql_pilihsiapa').table('users');
        var hasil = []
        for (const i of res) {
            const getUser = data_mysql.find(e=>e.uuid == i.uuid);
            if (!i.initiate_at) {
                i.initiate_at = getUser.created_at;
            }
            for (const ii of i.answer) {
                for (const iii of ii.answer) {
                    hasil.push({
                        Custom_Unique_ID: i.uuid,
                        Data_Date: moment().format('YYYY-MM-DD'),
                        Title: getUser.name,
                        Email:getUser.email,
                        Avatar: getUser.avatar,
                        Region:i.region,
                        Id_Carousel: i.id_carousel,
                        Id_Question: ii.id_question,
                        Id_Card: iii.id_card,
                        Answer:iii.type,
                        Value:0,
                        Created_At:i.created_at,
                        Initiate_At:getUser.created_at,
                    })
                }
                
            }
        }
        return response.json(hasil)
    }

    async pilihSiapaAnswer2 ({request, response}) {
        let res = await pilihSiapa.getPilihSiapaAnswer()
        res = res.map(e=>{
            e.answer = JSON.stringify(e.answer)
            return e
        })

        return response.json(res)
    }

    async pilihSiapaQuestion ({request, response}) {
        let {id} = request.all()
        const res = await pilihSiapa.getPilihSiapaQuestions(id)
        return response.json(res)
    }

    async pilihSiapaClaim ({request, response}) {
        let {id} = request.all();
        let res = await pilihSiapa.getPilihSiapaClaim()
        res =  res.map(e=>{
            return {
                Custom_Unique_ID: e.uuid,
                Data_Date: moment().format('YYYY-MM-DD'),
                Object_Id: e._id,
                Phone:e.phone,
                Id_Carousel:e.id_carousel,
                Region:e.region,
                Created_At:e.created_at,
                Reward:e.reward_type,
                Status:e.status
            }
        })
        return response.json(res)
    }

    async TixId ({ request, response}) {
        try {
            let {id,token} = request.all();
            var FormData = require('form-data');
            var data = new FormData();

            var config = {
            method: 'get',
            url: 'https://api.tix.id/v1/movies/now_playing?'+'city_id='+ id,
            headers: { 
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtc2lzZG4iOiIiLCJ1c2VyX2lkIjoiIiwiYXV0aF9zaWduIjoiZGExMTA3M2MtNDBhNS00ZWIxLWE0YTAtNzMzZjRiYTcxZTY4IiwicHVycG9zZSI6Im5vdGxvZ2luIiwiYXVkIjoiVGl4SUQgTWlkZGxld2FyZSIsImV4cCI6MTY5NTMwMjczMSwiaWF0IjoxNjg2NjYyNzMxLCJpc3MiOiJUaXhJRCBTZWN1cml0eSBBdXRob3JpdHkiLCJzdWIiOiJNb2JpbGUgYXV0aG9yaXphdGlvbiB0b2tlbiJ9.-4CvnB6rbB6GL4FetOtHarQN3QWEqMlI7Qs-dewpEhI', 
                ...data.getHeaders()
            },
            data : data
            };
            const hasil = await axios(config)
            
            var send_data = []
            for (const i of hasil.data.results) {
                send_data.push({
                    Custom_Unique_ID:id,
                    Movie_Id:i.id,
                    Data_Date: moment().format('YYYY-MM-DD'),
                    Title:i.title,
                    Poster:i.poster_path,
                    production_company:i.production_company,
                    actor:i.actor,
                    Age_Category:i.age_category,
                    producer: i.producer,
                    duration:i.duration,
                    director: i.director,
                    trailer_path: i.trailer_path,
                    rating_score: i.rating_score,
                    synopsis:i.synopsis
                })
            }console.log(send_data.length);
            var body_request = JSON.stringify({
                "token": token,
                "data": send_data,
                "type": "append"
            });
            
            var config2 = {
            method: 'post',
            url: 'https://api.enygma.id/v1/noAuth/multipleinsert',
            headers: { 
                'x-token-api': 'XNiCnLZMrfiFtQmC7mYLhT3OtuYsdm7Y', 
                'Content-Type': 'application/json'
            },
            data : body_request
            };
            const a = await axios(config2)
            console.log(a.data);
            return response.json(body_request);
        } catch (error) {
            console.log(error.message);
        }
    }

    async Monipad ({response}) {
        try {
            const data = await ShellScript.GetDataMonipad();
            return response.json(data)
        } catch (error) {
            return response.json(error.message);
        }
    }
    
    async Testing({ request, response}){
        // let data = fs.readFileSync($HOME+'public/files/blimbing.sql',{encoding:'utf8'});
        // data = data.split(';')
        // console.log(data.length);
        // for (const i of data) {
        //     await Database.raw(i)
        //     console.log(i);
        // }
        var token = ["","","","","","","","","","","","","","","","enygma_cnmceupmo","","","","","","enygma_kjhytbhgf","","","enygma_nsrmlfp","","","","","","","","","","enygma_cvfpjdp","","","","","","","","","","","enygma_edpsxqwfgn","","","","","","","",""]
        var object = [264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,315,316,317,322,323]
        for (const [ii,i] of object.entries()) {
            var temp_array = []
            let temp = await MongoDb.GetDataByCollection('dataset_access',{uid:i})
            temp = temp.include.split(',')
            temp.push(token[ii])
            const newval = {include:temp.toString()}
            // await MongoDb.UpdateDataByCollection('dataset_access',{uid:i},newval)
        }
        return response.json('sudah')
    }

    async GenerateCctvKaltim({response}){
        let a = await kaltim.Generate_link_cctv_kaltim()
        return response.json(a)
    }

    async GetLaminetam({ request, response}){
        let {name,id_cam,id_cam_point} = request.all()
        let a = await kaltim.Laminetam()
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

    async RemovePilihSaiapa ({request, response}) {
        let query = request.all();
        const hapus = await MongoDb.DeletePilihSiapa(query)
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

    async BackupDailyArtemis ({request,response}){
        let {cam} = request.all()
        let a = await Daily.BackupDailyArtemis()
        return response.json(a)
    }

    async CountSurveyor ({request,response}) {
        let {token} = request.all()
        if (!token) {
            return response.status(400).json({status:400, message:"Invalid request Token"})
        }
        async function getResultWeekly(){
            const data_mysql = await Database.table('external_data_layers').where('token',token).whereNull('deleted_at').first()
            var day = [], result_object = {
                custom_unique_id:1,
                data_date:moment().format('YYYY-MM-DD'),
                token:data_mysql.token,
                title:data_mysql.name.split(' ')[data_mysql.name.split(' ').length-1]
            },total=0
            for (let i = 0; i < 7; i++) {
                day.push(moment().subtract(i, "days").format('YYYY-MM-DD'))
            }
            for (const i of day) {
                const query = {externalDataToken:token,"detail.Data_Date":i}
                const data = await MongoDb.CountCustom(query,'externaldatas')
                total = total + data
                result_object[moment(i).format('YYYY-MM-DD(dddd)')] = data
            }
            result_object.total=total
            return result_object
        }
        
        return response.json(await getResultWeekly())
    }
}

module.exports = ExternalRequestController
