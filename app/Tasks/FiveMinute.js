'use strict'

const Task = use('Task')
const FiveMin_Task = use("App/Helpers/FiveMin_Task")

class FiveMinute extends Task {
  static get schedule () {
    return '0 0,5,10,15,20,25,30,35,40,45,50,55 * * * *'
  }

  async handle () {
    await FiveMin_Task.InsertAt5RecordVehicle();
  }

}

module.exports = FiveMinute
