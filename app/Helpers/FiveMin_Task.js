'use strict';
const Anpr = use("App/Helpers/Anpr")
const moment = require('moment');
const MongoDb = use("App/Models/MongoDb");
const Processing = use("App/Helpers/Processing")

class FiveMin_Task {
    async InsertAt5RecordVehicle () {
        const list_camera = await Anpr.List_Camera();
        let str = moment().subtract(5,'minutes').utcOffset('+0700').format()
        let end = moment().utcOffset('+0700').format()
        try {
          if (typeof list_camera.data.list == 'object') {
            for (const i of list_camera.data.list) {
              if (i.status == 1) {
                var t0 = performance.now();
                var temp = await Anpr.Vehicle_Record_By_Time(i.cameraIndexCode,str,end)
                const insert = await MongoDb.MultipleInsertAnpr(temp)
                var t1 = performance.now();
                if (insert.insertedCount > 0) {
                  await Processing.Create_Logs(`Insert 5 Minutes Record Vehicle Cam ${i.cameraIndexCode} InsertCount : ${insert.insertedCount}`,"5MINS","Scheduler5",t1,t0);
                }else{
                  await Processing.Create_Logs(`Insert 5 Minutes Record Vehicle Cam ${i.cameraIndexCode} failed`,"5MINS","Scheduler5",t1,t0);
                }
              }
            }
          }
        } catch (error) {
          await Processing.Create_Logs(`Insert 5 Minutes Record Vehicle failed ${error.message}`,"5MINS","Scheduler5",0,0);
        }
        
      }
}

module.exports = new FiveMin_Task();