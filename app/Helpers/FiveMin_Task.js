'use strict';
const Anpr = use("App/Helpers/Anpr")
const moment = require('moment');
const MongoDb = use("App/Models/MongoDb");
const Processing = use("App/Helpers/Processing")
const axios = use('axios')

class FiveMin_Task {
    async InsertAt5RecordVehicle () {
        const now = moment().utcOffset('+0700').format('YYYY-MM-DDTHH:00:00Z');
        const list_camera = await Anpr.List_Camera();
        let str = moment().subtract(5,'minutes').utcOffset('+0700').format()
        let end = moment().utcOffset('+0700').format()
        if (typeof list_camera.data.list == 'object') {
          for (const i of list_camera.data.list) {
            try {
              if (i.status == 1) {
                var t0 = performance.now();
                var temp = await Anpr.Vehicle_Record_By_Time(i.cameraIndexCode,str,end)
                let data_anpr_dataset = []
                for (const dt of temp) {
                    data_anpr_dataset.push({
                      "Custom_Unique_ID": dt.crossRecordSyscode,
                      "Data_Date": moment().format("YYYY-MM-DD"),
                      "Cross_Record_Syscode": dt.crossRecordSyscode,
                      "Camera_Index_Code": dt.cameraIndexCode,
                      "Plate_No": dt.plateNo,
                      "Owner_Name": dt.ownerName,
                      "Contact": dt.contact,
                      "Vehicle_Picture": dt.vehiclePicUri,
                      "Cross_Time": dt.crossTime,
                      "Vehicle_Color": dt['vehicleColor '],
                      "Vehicle_Type": dt['vehicleType '],
                      "Country": dt.country
                    })
                }
                data_anpr_dataset = data_anpr_dataset.filter(x=>x.Plate_No != "Unknown")
                await this.SaveToEnygmaDataset(data_anpr_dataset)
                const insert = await MongoDb.MultipleInsertAnpr(temp)
                var t1 = performance.now();
                if (insert.insertedCount > 0) {
                  await Processing.Create_LogsV2(23,Number(i.cameraIndexCode),'scheduler','scheduler_mongodb','fivemin',now,`Generate five minutes Record Vehicle Cam ${i.cameraIndexCode} User 23 successfully`,t1,t0,true);
                }else{
                  await Processing.Create_LogsV2(23,Number(i.cameraIndexCode),'scheduler','scheduler_mongodb','fivemin',now,`Generate five minutes Record Vehicle Cam ${i.cameraIndexCode} User 23 data null`,t1,t0,true);
                }
              }
            } catch (error) {
              await Processing.Create_LogsV2(23,null,'scheduler','scheduler_mongodb','fivemin',now,`Generate five minutes Record Vehicle Cam ${i.cameraIndexCode} User 23 ${error.message}`,0,0,false);
            }
          }
        }
      }

    async SaveToEnygmaDataset (data) {
      let data_req = JSON.stringify({
        "token": "enygma_sbkuyxsqp",
        "type": "append",
        "data": data
      })
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.enygma.id/v1/datasets/multipleinsert/23',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer 6aaf887d751793b67715009b2ed30935mtr503GkkE8D62/Votd3AjIBAHUCdCFEtgdqv0OXZ4u+ktr8f1lKWqeCYqBYHpn8'
        },
        data : data_req
      }
      await axios.request(config)
    }
}

module.exports = new FiveMin_Task();