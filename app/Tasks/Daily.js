'use strict'

const Task = use('Task')
const Daily_Task = use("App/Helpers/Daily_Task")

class Daily extends Task {
  static get schedule () {
    return '0 0 6,12 */1 * *'
  }

  async handle () {
    await Daily_Task.SiskaperbapoByMetadata();
    await Daily_Task.Maritim_Meta();
    await Daily_Task.Maritim_Viewboard();
    await Daily_Task.GenerateStatsDatasets();
    await Daily_Task.GenerateMonipad();
  }

}

module.exports = Daily
