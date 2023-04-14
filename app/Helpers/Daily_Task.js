'use strict'
const fs = require('fs');
const Maritim = use("App/Helpers/Maritim")
const ShellScript = use("App/Helpers/ShellScript")
const Processing = use("App/Helpers/Processing")
const siskaperbapo = use("App/Helpers/Siskaperbapo")
const MongoDb = use("App/Models/MongoDb")
const moment = require('moment');
const Env = use('Env');
const $HOME = Env.get('PATH_DIR')
const Database = use("Database");

class Daily_Task {

    async InsertLast2Day () {
        const now = moment().utcOffset('+0700').format('YYYY-MM-DDT00:00:00Z');
        let h_1 = moment(now).subtract(1,'days').utcOffset('+0700').format();
        let hp1 = moment(h_1).add(1,'days').utcOffset('+0700').format();
        let user = fs.readFileSync($HOME+'public/files/data_user/cctv_last2day.json',{encoding:'utf8'});
        user = JSON.parse(user).data
        for (const i of user) {
            const _delete_q = {externalDataToken:i.token,userId:Number(i.user),'detail.Data_Date':moment().subtract(3,'days').utcOffset('+0700').format('YYYY-MM-DD')};
            let day1 = await MongoDb.findANPR({
                crossTime:{
                    $gte: h_1,
                    $lt: hp1,
                }
            });
            
            const res = day1.map( x => {
                x.Custom_Unique_ID = x.crossRecordSyscode
                x.Data_Date = moment().subtract(1,'days').utcOffset('+0700').format('YYYY-MM-DD')
                delete x._id
                delete x.crossRecordSyscode
                return x    
            });
            
        }
        return 0
    }

    async GenerateMonipad () {
        try {
            var t0 = performance.now();
            await ShellScript.GetDataMonipad();
            var t1 = performance.now();
            await Processing.Create_Logs(`Insert Daily Monipad Successfully `,"14400MINS","Scheduler1440",t1,t0);
        } catch (error) {
            await Processing.Create_Logs(`Insert Daily Monipad Failed ${error.message} `,"14400MINS","Scheduler1440",0,0);
        }
    }

    async GenerateStatsDatasets () {
        try {
            let user = fs.readFileSync($HOME+'public/files/data_user/stats_dataset.json',{encoding:'utf8'});
            user = JSON.parse(user).user
            for (const i of user) {
                var t0 = performance.now();
                let data = await Processing.getStatistik(i);
                const save = await Processing.SaveStatsDataset(i,'stast_dataset',data);
                var t1 = performance.now();
                if (save.status == 200) {
                    await Processing.Create_Logs(`Insert Daily Statistic Datasets User ${i} Successfully `,"14400MINS","Scheduler1440",t1,t0);
                }else{
                    await Processing.Create_Logs(`Insert Daily Statistic Datasets User ${i} Failed `,"14400MINS","Scheduler1440",t1,t0);
                }
            }
        } catch (error) {
            return await Processing.Create_Logs(`Insert Daily Statistic Datasets User Failed ${error.message} `,"14400MINS","Scheduler1440",0,0);
        }
    }
      
    async Maritim_Meta () {
        try {
            var res = []
            let user = fs.readFileSync($HOME+'public/files/data_user/user_enygma_maritim.json',{encoding:'utf8'});
            const meta_maritim = await Maritim.meta_maritim();
            for (const i of JSON.parse(user).data) {
                var t0 = performance.now();
                const del_meta = await MongoDb.DeleteByToken(i.meta,i.user)
                const req_meta = await Processing.Get_ExternalDataLayers(i.meta)
                var t1 = performance.now();
                if (meta_maritim.length>0) {
                    const insrt_meta = await Processing.InsertByToken(meta_maritim,req_meta,'append')
                    if (insrt_meta.insertedCount > 0) {
                    await Processing.Create_Logs(`Insert Daily Record Meta Maritim User ${i.user} InsertCount : ${insrt_meta.insertedCount}`,"1440MINS","Scheduler1440",t1,t0);
                    }else{
                    await Processing.Create_Logs(`Insert Daily Record Meta Maritim User ${i.user} failed`,"14400MINS","Scheduler1440",t1,t0);
                    }
                }
            }
        } catch (error) {
        return await Processing.Create_Logs(`Insert Daily Record Meta Maritim failed ${error.message} `,"14400MINS","Scheduler1440",0,0);
        }
    }

    async Maritim_Viewboard () {
        try {
            var res = []
            let user = fs.readFileSync($HOME+'public/files/data_user/user_enygma_maritim.json',{encoding:'utf8'});
            const viewboard_maritim = await Maritim.viewboard_maritim();
            for (const i of JSON.parse(user).data) {
                var t0 = performance.now();
                const del_viewboard = await MongoDb.DeleteByToken(i.viewboard,i.user)
                const req_viewboard = await Processing.Get_ExternalDataLayers(i.viewboard)
                var t1 = performance.now();
                if (viewboard_maritim.length>0) {
                    const insrt_viewboard = await Processing.InsertByToken(viewboard_maritim,req_viewboard,'append')
                    if (insrt_viewboard.insertedCount > 0) {
                        res.push(insrt_viewboard.insertedCount)
                    await Processing.Create_Logs(`Insert Daily Record Viewboard Maritim User ${i.user} InsertCount : ${insrt_viewboard.insertedCount}`,"60MINS","Scheduler60",t1,t0);
                    }else{
                        res.push('0 '+ i.viewboard,i.user)
                    await Processing.Create_Logs(`Insert Daily Record Viewboard Maritim User ${i.user} failed`,"60MINS","Scheduler60",t1,t0);
                    }
                }
            }
            return res
        } catch (error) {
            return await Processing.Create_Logs(`Insert Daily Record Viewboard Maritim failed ${error.message}`,"60MINS","Scheduler60",0,0);
        }
    }

    async Siskaperbapo () {
        try {
            const komoditas = await MongoDb.findExternalData({
                userId:76,
                externalDataToken:'enygma_yrjrktfrh',
                deleted_at:null
            });
            for (const i of komoditas) {
                let data = await siskaperbapo.GenerateSiskaperbapo(i.detail.Custom_Unique_ID);
                  if (data.subject) {
                    await Processing.UpdateS3File(i.detail.Geojson_File,data);
                  }
              }
            return console.log('success siskaperbapo');
        } catch (e) {
            return console.log(e.message);
        }
    }

    async SiskaperbapoByMetadata () {
        try {
            const komoditas = await MongoDb.findExternalData({
                userId:76,
                externalDataToken:'enygma_irxflin',
                deleted_at:null
            });
            var vlnm = []
            for (var i = 0; i < 5; i++) {
                vlnm.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
            }
            
            await Database
            .table('external_data_layers')
            .where('token', 'enygma_irxflin')
            .update({ value_name: (vlnm.reverse()).toString()})
            await MongoDb.DeleteByToken('enygma_eyycuplokd',76)
            for (const i of komoditas) {
                var t0 = performance.now();
                let data = await siskaperbapo.GenerateSiskaperbapoByMeta(i.detail.Custom_Unique_ID);
                if (data.length>0) {
                    const insrt_meta = await Processing.InsertByToken(data,{
                        user_id:76,
                        id:1386,
                        token:'enygma_eyycuplokd',
                    },'append')
                var t1 = performance.now();
                if (insrt_meta.insertedCount > 0) {
                    await Processing.Create_Logs(`Insert Daily Record Meta Siskaperbapo ${i.detail.Custom_Unique_ID} InsertCount : ${insrt_meta.insertedCount}`,"1440MINS","Scheduler1440",t1,t0);
                }else{
                    await Processing.Create_Logs(`Insert Daily Record Meta Siskaperbapo ${i.detail.Custom_Unique_ID} failed`,"14400MINS","Scheduler1440",t1,t0);
                } 
                }
            }
            return console.log('success siskaperbapo');
        } catch (e) {
            return console.log(e.message);
        }
    }
}

module.exports = new Daily_Task()