'use strict';
const Anpr = use("App/Helpers/Anpr");
const moment = require('moment');
const Processing = use("App/Helpers/Processing");
const MOngodb = use("App/Models/MongoDb");
const fs = require('fs');
const Env = use('Env');
const $HOME = Env.get('PATH_DIR')
class Hourly_Task {

    async Generate_Anpr () {
        const now = moment().utcOffset('+0700').format('YYYY-MM-DDTHH:00:00Z');
        let id_cam = fs.readFileSync($HOME+'public/files/data_user/id_cam.json',{encoding:'utf8'});
        id_cam = JSON.parse(id_cam).data
        try {
          for (const i of id_cam) {
            var t0 = performance.now();
            var temp = await Anpr.Generate_Anpr_Hourly(i.id_cam,i.id_cam_point,i.name,now);
      
            let bodyContent = JSON.stringify({
                "path_dir":"geomarker/23/keamanan/Malang_Traffic_Cam/",
                "name":`${i.id_cam_point}.json`,
                "data":temp
            });
            var generate = await Processing.SavePublicDir(bodyContent);
            var t1 = performance.now();
            if (generate.status == 200) {
              await Processing.Create_Logs(`Generate 1 Hour Record Vehicle Cam ${i.id_cam} successfully`,"60MINS","Scheduler60",t1,t0);
            }else{
              await Processing.Create_Logs(`Generate 1 Hour Record Vehicle Cam ${i.id_cam} failed`,"60MINS","Scheduler60",t1,t0);
            }
          }
          return 'Successfully generated'
        } catch (error) {
          await Processing.Create_Logs(`Generate 1 Hour Record Vehicle failed ${error.message}`,"60MINS","Scheduler60",0,0);
        }
        
    
    }

    async Generate_Anpr_Datasets () {
      const now = moment().utcOffset('+0700').format('YYYY-MM-DDTHH:00:00Z');
      let id_cam = fs.readFileSync($HOME+'public/files/data_user/id_cam_datasets.json',{encoding:'utf8'});
      id_cam = JSON.parse(id_cam)
      let res = []
      try {
        for (const i of id_cam) {
          for (const cam of i.data) {
            // GENERATE WITH DATASETS
            var t0 = performance.now();
            var temp = await Anpr.Generate_Anpr_Dataset(cam.id_cam,cam.id_cam_point,cam.name,now);
            for (const l of [temp]) {
              res.push({
                "userId":Number(i.user_id),
                "externalDataId":Number(i.externalDataId),
                "externalDataToken":i.token,
                "detail":l,
                created_at : new Date(), 
                updated_at : new Date(),
                deleted_at : null
              })
            }
            var t1 = performance.now();
            // await Processing.Create_Logs(`Generate 1 Hour Record Vehicle Cam ${i.data.id_cam} User ${i.user_id} successfully`,"60MINS","Scheduler60",t1,t0);
            await Processing.Create_LogsV2(i.user_id,Number(i.externalDataId),'scheduler','scheduler_dataset','hourly',now,`Generate 1 Hour Record Vehicle Cam ${cam.id_cam} User ${i.user_id} successfully`,t1,t0);
          }
          // await MOngodb.DeleteByToken(i.token,23)
          // await MOngodb.MultipleInsert(res);
        }
      } catch (error) {
        // await Processing.Create_Logs(`Generate 1 Hour Record Vehicle failed ${error.message}`,"60MINS","Scheduler60",0,0);
      }
    }
}

module.exports = new Hourly_Task();