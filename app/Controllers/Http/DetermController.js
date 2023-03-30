'use strict'
const organization = 157092 //138138
const access_token = '4qdxy4i7uze27eq047at4repkdywt3d91cqx6nbwrp7r90ldoe'
const axios = require('axios');
const moment = require('moment');

class DetermController {

    async ListKeyword ({response}) {
        try {
            var config = {
                method: 'get',
                url: `https://api.mediatoolkit.com/organizations/${organization}/groups?access_token=${access_token}`,
                headers: { }
                };
                
                const d = await axios(config);
                var a = [],temp = []
                for (const i of d.data.data.groups) {
                for (const z of i.keywords) {
                    temp.push({
                        keyword:z.name,
                        id:z.id
                    })
                }
                a.push({
                    id:i.id,
                    group:i.name,
                    keywords:temp
                })
                temp = []
            }
            return response.status(200).json({status:200,message:'success',data:a});
        } catch (error) {
            return response.status(500).json({status:500,message:error.message});
        }
        
    }

    async MediaTool ({request,response}) {
        try {
            let {id,group} = request.all()
            var now = moment().unix();
            var twelveago = moment().subtract(24, 'hours').unix();
            var config = {
                method: 'get',
                url: `https://api.mediatoolkit.com/organizations/${organization}/groups/${group}/keywords/${id}/mentions?access_token=${access_token}&count=400&from_time=${twelveago}&to_time=${now}`,
                headers: { 
                    'Cookie': 'mm_sess=dkmoreg9v6am7pceanjekumuds'
                }
            };
      
            const d = await axios(config);
            return response.status(200).json({status:200,message:'success',data:d.data.data.response});
        } catch (e) {
            console.log(e);
            return response.status(400).json({status:400,message:e.message });
        }
    }

    async MediaToolKit_feed ({request, response}) {
        try {
            let {id,group} = request.all()
            var now = moment().unix();
            var twelveago = moment().subtract(24, 'hours').unix();
            var config = {
            method: 'get',
            // url:`https://app.determ.com/api/v2/organization/138138/group/196760/keyword/6563220/mentions/scroll`
            url: `https://api.mediatoolkit.com/organizations/${organization}/groups/${group}/keywords/${id}/mentions?access_token=${access_token}&count=400&from_time=${twelveago}&to_time=${now}`,
            headers: { 
                'Cookie': 'mm_sess=dkmoreg9v6am7pceanjekumuds'
            }
            };
      
            const d = await axios(config);
            return response.status(200).json({status:200,message:'success',data:d.data.data.response});
        } catch (e) {
          console.log(e);
            return response.status(400).json({status:400,message:e.message });
        }
    }

    async ReactionMediatoolkit ({request,response}) {
        try {
            request.body.organization_id = organization
            var data = JSON.stringify(request.body);
            var addsentiment = {
                method: 'post',
                url: 'https://app.determ.com/api/backend/mention/add-sentiment/',
                    headers: { 
                        'Authorization': 'Bearer 7o99auan9sav2i9emo0b2gss8fm7l7xbhrlrv249mj5ecp1mea', 
                        'Content-Type': 'application/json', 
                        'Cookie': 'mm_sess=dkmoreg9v6am7pceanjekumuds; _csrf=d79570b0e4406e16202441185d5d0beb45321d8521427bf47681f55352e8eebca%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%2213THp61Adj8ucBdk61M6Z2GOvrqN4iN2%22%3B%7D'
                    },
                data : data
            };
    
            const datas = await axios(addsentiment);
            return res.status(200).json({status:200,message:'success',data:datas.data});
        } catch (e) {
            return res.status(400).json({status:400,message:e.message });
        }
    }
}

module.exports = DetermController
