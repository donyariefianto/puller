'use strict'

const Task = use('Task')
const Hourly_Task = use("App/Helpers/Hourly_Task");
const Env = use('Env')
const project = Env.get('SERVICE_PROJECT')
class Hourly extends Task {
  static get schedule () {
    return '0 0 */1 * * *'
  }

  async handle () {
    if (project==='enygma') {
      // await Hourly_Task.Generate_Anpr();
      await Hourly_Task.Generate_Anpr_Datasets();
    }
  }

}

module.exports = Hourly
