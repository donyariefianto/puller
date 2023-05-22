'use strict'

const Task = use('Task')
const FiveMin_Task = use("App/Helpers/FiveMin_Task")
const Env = use('Env')
const project = Env.get('SERVICE_PROJECT')

class FiveMinute extends Task {
  static get schedule () {
    return '0 0,5,10,15,20,25,30,35,40,45,50,55 * * * *'
  }

  async handle () {
    return
    if (project==='enygma') {
      await FiveMin_Task.InsertAt5RecordVehicle();
    }
  }

}

module.exports = FiveMinute
