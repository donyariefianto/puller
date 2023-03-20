'use strict';
// const { exec } = require('child_process');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const moment = require('moment');
const MongoDb = use("App/Models/MongoDb");

class ShellScript {

    async GetDataMonipad () {
        let user = 76, token = 'enygma_fzthgto', id_token = '602';
        //insecure mode
        const curl = 'curl --insecure --location --request POST https://monipad.dipendajatim.go.id/monipad/index.php/ws/pad/getDataTotal --header Accept:*/* --form user=kominfo --form pass=e4170edb9759b6579dc850a4d38affc68204cf5f5cff724d90f0a921460a9d7b'
        const { stdout, stderr } = await exec(curl);
        var vl = []
        for (const [numb,i] of JSON.parse(stdout).data.pad.entries()) {
            vl.push({
                "userId":Number(user),
                "externalDataId":Number(id_token),
                "externalDataToken":token,
                "detail":{
                    "Custom_Unique_ID":numb+1,
                    "Data_Date": moment().format('YYYY-MM-DD'),
                    "Label":i.LABEL,
                    "SKT":i.SKT,
                    "Sisa_Hari":JSON.parse(stdout).data.sisahari,
                    "Target":Number(i.TARGET),
                    "Hari_Lalu":Number(i.HARILALU),
                    "Pro_Hari_Lalu":Number(i.PRO_HARILALU),
                    "Jumlah":Number(i.JUMLAH),
                    "Pro":Number(i.PROSEN),
                    "Hari_Ini":Number(i.HRINI),
                    "Pro_Hari_Ini":Number(i.PROHRINI),
                    "Kurang":Number(i.KURANG),
                    "Pro_Kurang":Number(i.PROKURANG),
                    "Icon_Dev":i.KURANG > 0 ? 'minus-circle' : 'plus-circle',
                    "Color_Dev":i.KURANG > 0 ? 'red' : 'green',
                    "Deviasi":i.JUMLAH - i.TARGET,
                    "Icon_pro_dev":'percentage',
                    "Color_Pro_Dev":i.KURANG > 0 ? 'red' : 'green',
                    "Pro_Dev":Number((i.JUMLAH / i.TARGET * 100).toFixed(2)),
                    },
                created_at : new Date(), 
                updated_at : new Date(), 
                deleted_at : null
            })
        }
        await MongoDb.DeleteByToken('enygma_fzthgto',76)
        await MongoDb.MultipleInsert(vl)
        return 'Successfully'
    }

}

module.exports = new ShellScript();