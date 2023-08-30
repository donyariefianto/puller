'use strict';
const Anpr = use("App/Helpers/Anpr")
class Monthly_Task {
    async DeletePrevMonth () {
        await Anpr.DeletePrevMonth()
    }
}

module.exports = new Monthly_Task();