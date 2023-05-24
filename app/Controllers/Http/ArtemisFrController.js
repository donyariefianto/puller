'use strict'
const ShellScript = use("App/Helpers/ShellScript");

class ArtemisFrController {
    
    async getAllTreeCode ({response}) {
        let res = await ShellScript.afr_getAllTreeCode();
        return response.json(res)
    }

    async regions ({response}) {
        let res = await ShellScript.afr_regions();
        return response.json(res)
    }

    async regions_root ({response}) {
        let res = await ShellScript.afr_regions_root();
        return response.json(res)
    }
}

module.exports = ArtemisFrController
