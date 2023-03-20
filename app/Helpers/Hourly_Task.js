'use strict';
const Anpr = use("App/Helpers/Anpr");
const moment = require('moment');
const Processing = use("App/Helpers/Processing");

class Hourly_Task {

    async Generate_Anpr () {
        const now = moment().utcOffset('+0700').format('YYYY-MM-DDTHH:00:00Z');
        var id_cam = [
          {name:'Perempatan Gadang',id_cam:"13",id_cam_point:"104"},
          {name:'Pertigaan Kacuk',id_cam:"5",id_cam_point:"103"},
          {name:'Perbatasan Batu-Malang',id_cam:"9",id_cam_point:"105"},
          {name:'Jembatan Kali Sari',id_cam:"1",id_cam_point:"101"}
          
        ]
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
            if (generate.status) {
              await Processing.Create_Logs(`Generate 1 Hour Record Vehicle Cam ${i.id_cam} successfully`,"60MINS","Scheduler60",t1,t0);
            }else{
              await Processing.Create_Logs(`Generate 1 Hour Record Vehicle Cam ${i.id_cam} failed`,"60MINS","Scheduler60",t1,t0);
            }
          }
        } catch (error) {
          await Processing.Create_Logs(`Generate 1 Hour Record Vehicle failed ${error.message}`,"60MINS","Scheduler60",0,0);
        }
        
    
    }
}

module.exports = new Hourly_Task();