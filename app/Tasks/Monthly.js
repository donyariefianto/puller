'use strict'

const Task = use('Task')
const Env = use('Env')
const project = Env.get('SERVICE_PROJECT')
const Monthly_Task = use("App/Helpers/Monthly_Task")

class Monthly extends Task {
  static get schedule () {
    return '0 0 1 */1 *'
  }

  async handle () {
    if (project==='enygma') {
      await Monthly_Task.DeletePrevMonth()
    }
  }
}

module.exports = Monthly
