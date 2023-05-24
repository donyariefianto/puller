'use strict'
const Maritim = use("App/Helpers/Maritim")
const Processing = use("App/Helpers/Processing")
const MongoDb = use("App/Models/MongoDb")
const moment = require('moment');
const fs = require('fs');
const axios = require('axios');
var CryptoJS = require("crypto-js");
let sk = 'BUqUMHfEPbK9GcTUl06h'
const base_url = 'http://103.135.14.146/'
const minio = use("App/Helpers/Minio");
class Anpr {

    async Vehicle_Record_By_Time (cam,str,end) {
        var data = JSON.stringify({
            "cameraIndexCode": cam,
            "startTime": `${str}`,
            "endTime": `${end}`,
            "pageNo": 1,
            "pageSize": 500
            });
    
        let anpr = {
            method: 'POST',
            url: `${base_url}/artemis/api/pms/v1/crossRecords/page`,
            headers: {
                'Accept': 'application/json', 
                'Content-Type': 'application/json;charset=UTF-8', 
                'X-Ca-Key': '23039554', 
                'X-Ca-Signature': `${this.generateSignature(sk,'POST',`${base_url}/artemis/api/pms/v1/crossRecords/page`)}`
            },
            data : data,
        };
        const datas = await axios(anpr);
        return datas.data.data.list
    }

    async Anpr_LastHour (id_cam,h,h2,time_type,now) {
        let start = moment(now).utcOffset('+0700').subtract(h,time_type).format();
        let end = moment(now).utcOffset('+0700').subtract(h2,time_type).format();

        let hasil = await MongoDb.Count_Data_Artemis({
            crossTime:{
                $gte: start,
                $lt: end
            },
            cameraIndexCode:id_cam
        });

        let hasil_know = await MongoDb.Count_Data_Artemis({
            crossTime:{
                $gte: start,
                $lt: end
            },
            cameraIndexCode:id_cam,
            plateNo:{$ne:"Unknown"}
        });
        return {
            hasil,hasil_know
        }
    }

    async Anpr_LastHourV2 (id_cam,start,end) {
        let hasil = await MongoDb.Count_Data_Artemis({
            crossTime:{
                $gte: start,
                $lt: end
            },
            cameraIndexCode:id_cam
        });

        let hasil_know = await MongoDb.Count_Data_Artemis({
            crossTime:{
                $gte: start,
                $lt: end
            },
            cameraIndexCode:id_cam,
            plateNo:{$ne:"Unknown"}
        });
        return {
            hasil,hasil_know
        }
    }

    async Generate_Anpr_Hourly (id_cam,id_cam_point,name,now) {
        let today = moment(now).utcOffset('+0700').format("YYYY-MM-DDT00:00:00Z")
        let month = moment(now).utcOffset('+0700').format("YYYY-MM-01T00:00:00Z")
        let StartWeek = moment(today).utcOffset('+0700').startOf('week').format("YYYY-MM-DDT00:00:00Z")
        let EndWeek = moment(today).utcOffset('+0700').endOf('week').format("YYYY-MM-DDT00:00:00Z")
        let twenty4h_k = [],twenty4h_u = [],time_24=[]
        for (let i = 0; i < 24; i++) {
            let temp = await this.Anpr_LastHourV2(id_cam,Processing.AddTime(today,i,'hour'),Processing.AddTime(today,(i+1),'hour'));
            time_24.push(moment(Processing.AddTime(today,(i),'hour')).utcOffset('+0700').calendar())
            twenty4h_k.push(temp.hasil_know)
            twenty4h_u.push(temp.hasil)
        }
        // twenty4h_k = twenty4h_k.reverse();
        // twenty4h_u = twenty4h_u.reverse();
        let one_hour = await this.Anpr_LastHour(id_cam,1,0,'hours',now);
        let two_hour = await this.Anpr_LastHour(id_cam,2,1,'hours',now);
        let three_hour = await this.Anpr_LastHour(id_cam,3,2,'hours',now);

        let H = await this.Anpr_LastHourV2(id_cam,today,now);
        let H_1 = await this.Anpr_LastHour(id_cam,2,1,'days',today);
        let H_2 = await this.Anpr_LastHour(id_cam,3,2,'days',today);

        let W = await this.Anpr_LastHourV2(id_cam,StartWeek,EndWeek);
        let W_1 = await this.Anpr_LastHourV2(id_cam,Processing.SubtractTime(StartWeek,1,'week'),Processing.SubtractTime(EndWeek,1,'week'));
        let W_2 = await this.Anpr_LastHourV2(id_cam,Processing.SubtractTime(StartWeek,2,'week'),Processing.SubtractTime(EndWeek,2,'week'));

        let M = await this.Anpr_LastHourV2(id_cam,month,now);
        let M_1 = await this.Anpr_LastHour(id_cam,2,1,'months',month);
        let M_2 = await this.Anpr_LastHour(id_cam,3,2,'months',month);

        var json = {
            "id": `${id_cam_point}`,
            "subject": [
                {
                    "title": "Malang Traffic Cam",
                    "subtitle": `Live Stream Onsite - Last Update:${moment().utcOffset('+0700').format('llll')}`,
                    "reload": 0,
                    "datavariant": [
                        {
                            title: name,
                            data:[
                                {
                                    "type": "video",
                                    "title": "Live Stream ",
                                    "subtype": "hls",
                                    "value": `https://103.135.14.146/enygma/cam${id_cam_point}.stream/playlist.m3u8`,
                                    "fullwidth": 1
                                },
                                {
                                    "type": "datalabel",
                                    "subtype": null,
                                    "title": "Kendaraan Melintas Hari Ini",
                                    "value": H.hasil,
                                    "unit": "Kendaraan"
                                },
                                {
                                    "type": "datalabel",
                                    "subtype": null,
                                    "title": "Kendaraan Melintas Terdeteksi Hari Ini",
                                    "value": H.hasil_know,
                                    "unit": "Kendaraan"
                                },
                                {
                                    "type": "multilabel",
                                    "subtype": null,
                                    "title": "Kendaraan Terdeteksi Plat Nomor",
                                    "value": [
                                        one_hour.hasil,
                                        H.hasil,
                                        W.hasil,
                                        M.hasil
                                    ],
                                    "unit": [
                                        "Jam ini",
                                        "Hari ini",
                                        "Minggu ini",
                                        "Bulan ini"
                                    ]
                                },
                                {
                                    "type": "chart-pie",
                                    "subtype": "rose",
                                    "title": "Komposisi Inderaja Hari ini",
                                    "series": [
                                        {
                                            "title": [
                                                "Kendaraan Terdeteksi",
                                                "Terkenali Plat Nomor"
                                            ],
                                            "value": [
                                                H.hasil_know,
                                                H.hasil
                                            ],
                                            "unit": "Kendaraan Bermotor"
                                        }
                                    ],
                                    "fullwidth": 0
                                },
                                {
                                    "type": "chart-line",
                                    "subtype": null,
                                    "title": "Inderaja Kendaraan Bermotor Per Jam",
                                    "series": [
                                        {
                                            "title": [
                                                "J-2",
                                                "J-1",
                                                "J"
                                            ],
                                            "value": [
                                                three_hour.hasil_know,
                                                two_hour.hasil_know,
                                                one_hour.hasil_know,                                            
                                            ],
                                            "unit": "Plat Nomor"
                                        },
                                        {
                                            "title": [
                                                "J-2",
                                                "J-1",
                                                "J"
                                            ],
                                            "value": [
                                                three_hour.hasil,
                                                two_hour.hasil,
                                                one_hour.hasil,
                                            ],
                                            "unit": "Kendaraan"
                                        }
                                    ],
                                    "fullwidth": 0
                                },
                                {
                                    "type": "chart-line",
                                    "subtype": null,
                                    "title": "Inderaja Kendaraan Bermotor Per Hari",
                                    "series": [
                                        {
                                            "title": [
                                                "H-2",
                                                "H-1",
                                                "H"
                                            ],
                                            "value": [
                                                H_2.hasil_know,
                                                H_1.hasil_know,
                                                H.hasil_know,                                      
                                            ],
                                            "unit": "Plat Nomor"
                                        },
                                        {
                                            "title": [
                                                "H-2",
                                                "H-1",
                                                "H"
                                            ],
                                            "value": [
                                                H_2.hasil,
                                                H_1.hasil,
                                                H.hasil,
                                            ],
                                            "unit": "Kendaraan"
                                        }
                                    ],
                                    "fullwidth": 0
                                },
                                {
                                    "type": "chart-line",
                                    "subtype": null,
                                    "title": "Inderaja Kendaraan Bermotor Per Minggu",
                                    "series": [
                                        {
                                            "title": [
                                                "M-2",
                                                "M-1",
                                                "M"
                                            ],
                                            "value": [
                                                W_2.hasil_know,
                                                W_1.hasil_know,                                            
                                                W.hasil_know,                                            
                                            ],
                                            "unit": "Plat Nomor"
                                        },
                                        {
                                            "title": [
                                                "M-2",
                                                "M-1",
                                                "M"
                                            ],
                                            "value": [
                                                W_2.hasil,
                                                W_1.hasil,                                            
                                                W.hasil,                                            
                                            ],
                                            "unit": "Kendaraan"
                                        }
                                    ],
                                    "fullwidth": 1
                                },
                                {
                                    "type": "chart-line",
                                    "subtype": null,
                                    "title": "Inderaja Kendaraan Bermotor Per Bulan",
                                    "series": [
                                        {
                                            "title": [
                                                "B-2",
                                                "B-1",
                                                "B"
                                            ],
                                            "value": [
                                                M_2.hasil_know,
                                                M_1.hasil_know,
                                                M.hasil_know,
                                            ],
                                            "unit": "Plat Nomor"
                                        },
                                        {
                                            "title": [
                                                "B-2",
                                                "B-1",
                                                "B"
                                            ],
                                            "value": [
                                                M_2.hasil,
                                                M_1.hasil,                                            
                                                M.hasil,
                                            ],
                                            "unit": "Kendaraan"
                                        }
                                    ],
                                    "fullwidth": 1
                                }
                            ]
                        },
                        {
                            title: name,
                            "data": [
                                {
                                    "type": "chart-bar",
                                    "subtype": null,
                                    "title": "Inderaja Kendaraan Bermotor 24 jam terakhir",
                                    "series": [
                                        {
                                            "title": time_24,
                                            "value": twenty4h_k,
                                            "unit": "Plat Nomor"
                                        },
                                        {
                                            "title": time_24,
                                            "value": twenty4h_u,
                                            "unit": "Kendaraan"
                                        }
                                    ],
                                    "fullwidth": 1
                                },
                                {
                                    "type": "chart-radar",
                                    "subtype": null,
                                    "title": "Inderaja Kendaraan Bermotor 24 jam terakhir",
                                    "series": [
                                        {
                                            "title": time_24,
                                            "value": twenty4h_k,
                                            "unit": "Plat Nomor"
                                        },
                                        {
                                            "title": time_24,
                                            "value": twenty4h_u,
                                            "unit": "Kendaraan"
                                        }
                                    ],
                                    "fullwidth": 0
                                },
                                // {
                                //     "type": "image",
                                //     "subtype": "url",
                                //     "title": "Foto Top 5 Kendaraan Terdeteksi Minggu ini",
                                //     "value": [
                                //         "https://d1iqudb2hg8ayl.cloudfront.net/enygma/uploads/vehicles/1655222293363.jpg",
                                //         "https://d1iqudb2hg8ayl.cloudfront.net/enygma/uploads/vehicles/1665666726276.jpg",
                                //         "https://d1iqudb2hg8ayl.cloudfront.net/enygma/uploads/vehicles/1660031373098.jpg",
                                //         "https://d1iqudb2hg8ayl.cloudfront.net/enygma/uploads/vehicles/1656506151744.jpg",
                                //         "https://d1iqudb2hg8ayl.cloudfront.net/enygma/uploads/vehicles/1673351415028.jpg"
                                //     ],
                                //     "unit": null
                                // }
                            ]
                        }
                    ]
                }
            ]
        }

        return json
    }

    async Generate_Anpr_Dataset (id_cam,id_cam_point,name,now) {
        let today = moment(now).utcOffset('+0700').format("YYYY-MM-DDT00:00:00Z")
        let month = moment(now).utcOffset('+0700').format("YYYY-MM-01T00:00:00Z")
        let StartWeek = moment(today).utcOffset('+0700').startOf('week').format("YYYY-MM-DDT00:00:00Z")
        let EndWeek = moment(today).utcOffset('+0700').endOf('week').format("YYYY-MM-DDT00:00:00Z")
        let twenty4h_k = [],twenty4h_u = [],time_24=[]
        for (let i = 0; i < 24; i++) {
            let temp = await this.Anpr_LastHourV2(id_cam,Processing.AddTime(today,i,'hour'),Processing.AddTime(today,(i+1),'hour'));
            time_24.push(moment(Processing.AddTime(today,(i),'hour')).utcOffset('+0700').calendar())
            twenty4h_k.push(temp.hasil_know)
            twenty4h_u.push(temp.hasil)
        }
        // twenty4h_k = twenty4h_k.reverse();
        // twenty4h_u = twenty4h_u.reverse();
        let one_hour = await this.Anpr_LastHour(id_cam,1,0,'hours',now);
        let two_hour = await this.Anpr_LastHour(id_cam,2,1,'hours',now);
        let three_hour = await this.Anpr_LastHour(id_cam,3,2,'hours',now);

        let H = await this.Anpr_LastHourV2(id_cam,today,now);
        let H_1 = await this.Anpr_LastHour(id_cam,2,1,'days',today);
        let H_2 = await this.Anpr_LastHour(id_cam,3,2,'days',today);

        let W = await this.Anpr_LastHourV2(id_cam,StartWeek,EndWeek);
        let W_1 = await this.Anpr_LastHourV2(id_cam,Processing.SubtractTime(StartWeek,1,'week'),Processing.SubtractTime(EndWeek,1,'week'));
        let W_2 = await this.Anpr_LastHourV2(id_cam,Processing.SubtractTime(StartWeek,2,'week'),Processing.SubtractTime(EndWeek,2,'week'));

        let M = await this.Anpr_LastHourV2(id_cam,month,now);
        let M_1 = await this.Anpr_LastHour(id_cam,2,1,'months',month);
        let M_2 = await this.Anpr_LastHour(id_cam,3,2,'months',month);

        return {
            Custom_Unique_ID:id_cam_point,
            Data_Date:moment(now).utcOffset('+0700').format("YYYY-MM-DD"),
            Variant:'page_1',
            Url:`https://103.135.14.146/enygma/cam${id_cam_point}.stream/playlist.m3u8`,
            Name:name,
            Kendaraan_Melintas:H.hasil,
            Kendaraan_Melintas_Terdeteksi:H.hasil_know,
            Jam_ini:one_hour.hasil,
            Hari_ini:H.hasil,
            Minggu_ini:W.hasil,
            Bulan_ini:M.hasil,
            J_2:three_hour.hasil_know,
            J_1:two_hour.hasil_know,
            J:one_hour.hasil_know,
            H_2:H_2.hasil_know,
            H_1:H_1.hasil_know,
            H:H.hasil_know,
            M_2:W_2.hasil_know,
            M_1:W_1.hasil_know,
            M:W.hasil_know,
            B_2:M_2.hasil_know,
            B_1:M_1.hasil_know,
            B:M.hasil_know,
            AM12:twenty4h_u[0],
            AM1:twenty4h_u[1],
            AM2:twenty4h_u[2],
            AM3:twenty4h_u[3],
            AM4:twenty4h_u[4],
            AM5:twenty4h_u[5],
            AM6:twenty4h_u[6],
            AM7:twenty4h_u[7],
            AM8:twenty4h_u[8],
            AM9:twenty4h_u[9],
            AM10:twenty4h_u[10],
            AM11:twenty4h_u[11],
            PM12:twenty4h_u[12],
            PM1:twenty4h_u[13],
            PM2:twenty4h_u[14],
            PM3:twenty4h_u[15],
            PM4:twenty4h_u[16],
            PM5:twenty4h_u[17],
            PM6:twenty4h_u[18],
            PM7:twenty4h_u[19],
            PM8:twenty4h_u[20],
            PM9:twenty4h_u[21],
            PM10:twenty4h_u[22],
            PM11:twenty4h_u[23]
        }
        var page_1 = {
            Custom_Unique_ID:id_cam_point,
            Data_Date:moment(now).utcOffset('+0700').format("YYYY-MM-DD"),
            Variant:'page_1',
            Url:`https://103.135.14.146/enygma/cam${id_cam_point}.stream/playlist.m3u8`,
            Name:name,
            Kendaraan_Melintas:H.hasil,
            Kendaraan_Melintas_Terdeteksi:H.hasil_know,
            Jam_ini:one_hour.hasil,
            Hari_ini:H.hasil,
            Minggu_ini:W.hasil,
            Bulan_ini:M.hasil,
            J_2:three_hour.hasil_know,
            J_1:two_hour.hasil_know,
            J:one_hour.hasil_know,
            H_2:H_2.hasil_know,
            H_1:H_1.hasil_know,
            H:H.hasil_know,
            M_2:W_2.hasil_know,
            M_1:W_1.hasil_know,
            M:W.hasil_know,
            B_2:M_2.hasil_know,
            B_1:M_1.hasil_know,
            B:M.hasil_know,
            AM12:'-',
            AM1:'-',
            AM2:'-',
            AM3:'-',
            AM4:'-',
            AM5:'-',
            AM6:'-',
            AM7:'-',
            AM8:'-',
            AM9:'-',
            AM10:'-',
            AM11:'-',
            PM12:'-',
            PM1:'-',
            PM2:'-',
            PM3:'-',
            PM4:'-',
            PM5:'-',
            PM6:'-',
            PM7:'-',
            PM8:'-',
            PM9:'-',
            PM10:'-',
            PM11:'-'
        }
        var page_2 = {
            Custom_Unique_ID:id_cam_point,
            Data_Date:moment(now).utcOffset('+0700').format("YYYY-MM-DD"),
            Variant:'page_2',
            Url:'-',
            Name:'-',
            Kendaraan_Melintas:'-',
            Kendaraan_Melintas_Terdeteksi:'-',
            Jam_ini:'-',
            Hari_ini:'-',
            Minggu_ini:'-',
            Bulan_ini:'-',
            J_2:'-',
            J_1:'-',
            J:'-',
            H_2:'-',
            H_1:'-',
            H:'-',
            M_2:'-',
            M_1:'-',
            M:'-',
            B_2:'-',
            B_1:'-',
            B:'-',
            AM12:twenty4h_u[0],
            AM1:twenty4h_u[1],
            AM2:twenty4h_u[2],
            AM3:twenty4h_u[3],
            AM4:twenty4h_u[4],
            AM5:twenty4h_u[5],
            AM6:twenty4h_u[6],
            AM7:twenty4h_u[7],
            AM8:twenty4h_u[8],
            AM9:twenty4h_u[9],
            AM10:twenty4h_u[10],
            AM11:twenty4h_u[11],
            PM12:twenty4h_u[12],
            PM1:twenty4h_u[13],
            PM2:twenty4h_u[14],
            PM3:twenty4h_u[15],
            PM4:twenty4h_u[16],
            PM5:twenty4h_u[17],
            PM6:twenty4h_u[18],
            PM7:twenty4h_u[19],
            PM8:twenty4h_u[20],
            PM9:twenty4h_u[21],
            PM10:twenty4h_u[22],
            PM11:twenty4h_u[23]
        }
        return [page_1,page_2]
    }

    async Vehicle_Record (cam) {
        try {
            let str = moment().utcOffset('+0700').subtract(5,'minutes').format()
            let end = moment().utcOffset('+0700').format()
            var data = JSON.stringify({
            "cameraIndexCode": cam,
            // "startTime": `2023-02-02T09:45:00+07:00`,
            // "endTime": `2023-02-02T09:50:00+07:00`,
            "startTime": `${str}`,
            "endTime": `${end}`,
            "pageNo": 1,
            "pageSize": 500
            });
            let anpr = {
                method: 'POST',
                url: `${base_url}/artemis/api/pms/v1/crossRecords/page`,
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json;charset=UTF-8', 
                    'X-Ca-Key': '23039554', 
                    'X-Ca-Signature': `${this.generateSignature(sk,'POST',`${base_url}/artemis/api/pms/v1/crossRecords/page`)}`
                },
                data : data,
            };
            const datas = await axios(anpr);
            return {status:200,message:'success',data:datas.data.data}
        } catch (e) {
            return {status:400,message:e.message }
        }
    }

    async Vehicle_Picture (path) {
        try {
            var data = JSON.stringify({
                "picUri": `${path}`
            });
    
            let anpr = {
                method: 'POST',
                url: `${base_url}/artemis/api/pms/v1/image`,
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json;charset=UTF-8', 
                    'X-Ca-Key': '23039554', 
                    'X-Ca-Signature': `${this.generateSignature(sk,'POST',`${base_url}/artemis/api/pms/v1/image`)}`
                },
                data : data,
            };
            const datas = await axios(anpr);
            return {status:200,message:'success',data:datas.data}
        } catch (e) {
            return {status:400,message:e.message }
        }
    }

    async Vehicle_gpsDetail () {
        try {
            var data = JSON.stringify({
                "startTime": `${moment().subtract(1,'hours').format()}`,
                "endTime": `${moment().format()}`,
                // "mobilevehicleIndexCodes": "1,2",
                "pageNo": 1,
                "pageSize": 100
                });
    
            let anpr = {
                method: 'POST',
                url: `${base_url}/artemis/api/mobilesurveillance/v1/gpsDetails`,
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json;charset=UTF-8', 
                    'X-Ca-Key': '23039554', 
                    'X-Ca-Signature': `${generateSignature(sk,'POST',`${base_url}/artemis/api/mobilesurveillance/v1/gpsDetails`)}`
                },
                data : data,
            };
            const datas = await axios(anpr);
            return {status:200,message:'success',data:datas.data}
        } catch (e) {
            return {status:400,message:e.message }
        }
    }

    async Vehicle_Record_Overview () {
        try {
            var data = JSON.stringify({
                "beginTime": `${moment().subtract(1,'hours').format()}`,
                "endTime": `${moment().format()}`,
                "mobilevehicleIndexCodes": "1,2",
                "pageNo": 1,
                "pageSize": 10
                });
    
            let anpr = {
                method: 'POST',
                url: `${base_url}/artemis/api/mobilesurveillance/v1/recordOverview`,
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json;charset=UTF-8', 
                    'X-Ca-Key': '23039554', 
                    'X-Ca-Signature': `${this.generateSignature(sk,'POST',`${base_url}/artemis/api/mobilesurveillance/v1/recordOverview`)}`
                },
                data : data,
            };
            const datas = await axios(anpr);
            return {status:200,message:'success',data:datas.data}
        } catch (e) {
            return {status:400,message:e.message }
        }
    }

    async List_Camera () {
        try {
            var data = JSON.stringify({
            "pageNo": 1,
            "pageSize": 500
            });
    
            let list_cam = {
                method: 'POST',
                url: `${base_url}/artemis/api/resource/v1/cameras`,
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json;charset=UTF-8', 
                    'X-Ca-Key': '23039554', 
                    'X-Ca-Signature': `${this.generateSignature(sk,'POST',`${base_url}/artemis/api/resource/v1/cameras`)}`
                },
                data : data,
            };
            const datas = await axios(list_cam);
            return {status:200,message:'success',data:datas.data.data}
        } catch (e) {
            return {status:400,message:e.message }
        }
    }

    async BackupDailyRecord () {
        const now = moment().utcOffset('+0700').format('YYYY-MM-DD')
        try {
            var t0 = performance.now();
            let start = Processing.SubtractTime(now,1,'day')
            let end = Processing.SubtractTime(now,1,'day')
            start = moment(start).format('YYYY-MM-DDT00:00:00Z')
            end = moment(end).format('YYYY-MM-DDT23:59:59Z')
            let query = {
                crossTime:{
                    $gte: start,
                    $lt: end
                },
            }
            let hasil = await MongoDb.findANPR(query)
            hasil = hasil.map(e=>{
                delete e._id
                return e
            })
            var buf = Buffer.from(JSON.stringify(hasil))
            const meta =  { 'content-type': 'application/json' }
            await minio.PutObject(`/artemis/${now}.json`,buf,meta)
            var t1 = performance.now();
            return await Processing.Create_LogsV2('23','S3(MinIO)','scheduler','scheduler_dataset','daily',now,`Backup daily artemis anpr MinIO successfully`,t1,t0);
        } catch (error) {
            return await Processing.Create_LogsV2('23','S3(MinIO)','scheduler','scheduler_dataset','daily',now,`Backup daily artemis anpr MinIO ${error.message}`,0,0)
        }      
    }

    async DeletePrevMonth () {
        const now = moment().utcOffset('+0700').format('YYYY-MM-DD')
        try {
            var t0 = performance.now();
            const now = moment().utcOffset('+0700').format('YYYY-MM-DD')
            const time = Processing.SubtractTime(now,2,'month')
            const start = moment(time).startOf('month').format()
            const end = moment(time).endOf('month').format()
            const query = {
                crossTime:{
                    $gte: start,
                    $lt: end
                },
            }
            await MongoDb.DeleteByQueryColection(query,'artmsanpr')
            var t1 = performance.now();
            return await Processing.Create_LogsV2('23','S3(MinIO)','scheduler','scheduler_dataset','monthly',now,`Delete monthly artemis anpr MinIO successfully`,t1,t0)
        } catch (error) {
            return await Processing.Create_LogsV2('23','S3(MinIO)','scheduler','scheduler_dataset','monthly',now,`Delete monthly artemis anpr MinIO ${error.message}`,0,0)
        }
        
    }

    generateSignature (AS,METHOD,URL) {
        var appSecret = AS
        var textToSign = "";
        textToSign += METHOD + "\n";
        textToSign += 'application/json' + "\n";
        textToSign += 'application/json;charset=UTF-8' + "\n";
        var url_path = "/artemis" + URL.split("artemis")[1];
        url_path = url_path.replace("{{API_VER}}",  "v1");
        textToSign += url_path;
        var hash = CryptoJS.HmacSHA256(textToSign, appSecret);
        var signature = hash.toString(CryptoJS.enc.Base64);
        return signature;
    }

}

module.exports = new Anpr()