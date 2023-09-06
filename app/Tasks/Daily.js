'use strict'

const Task = use('Task')
const Daily_Task = use("App/Helpers/Daily_Task")
const Env = use('Env')
const project = Env.get('SERVICE_PROJECT')
class Daily extends Task {
  static get schedule () {
    return '0 0 23,9 * * *'
  }

  async handle () {
    if (project==='enygma') {
      await Daily_Task.GenerateMonipad();//tidak lemot
      await Daily_Task.Maritim_Meta();//sekitar 4 menit
      await Daily_Task.Maritim_Viewboard();//sekitar 5 menit
      // await Daily_Task.GenerateStatsDatasets();//sekitar 1 menitan dengan hasil json seperti viewboard
      await Daily_Task.BackupDailyArtemis()//sekitar  8 detik
      await Daily_Task.SiskaperbapoByMetadata();//sekitar 14 menit
    }
    if (project==='kaltim') {
      await Daily_Task.Laminetam();
      await Daily_Task.Cctvkaltim();
    }
  }

}

module.exports = Daily
