'use strict'

const Task = use('Task')
const Hourly_Task = use("App/Helpers/Hourly_Task");

class Hourly extends Task {
  static get schedule () {
    return '0 0 */1 * * *'
  }

  async handle () {
    await Hourly_Task.Generate_Anpr();
  }

}

module.exports = Hourly
