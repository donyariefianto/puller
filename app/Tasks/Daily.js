'use strict'

const Task = use('Task')
const Daily_Task = use("App/Helpers/Daily_Task")
const Env = use('Env')
const project = Env.get('SERVICE_PROJECT')
const moment = use('moment')
class Daily extends Task {
  static get schedule () {
    return '0 0 23,10 * * *'
  }

  async handle () {
    if (project==='enygma') {
      await this.ManagemenExpiredData()
      await Daily_Task.GenerateMonipad();//tidak lemot
      console.log('monipad is running daily');
      await Daily_Task.GenerateStatsDatasets();//sekitar 1 menitan dengan hasil json seperti viewboard
      await Daily_Task.BackupDailyArtemis()//sekitar  8 detik
      console.log('artmeis is running daily');
      await Daily_Task.SiskaperbapoByMetadata();//sekitar 14 menit
      console.log('siskaperbapo is running daily');
      await Daily_Task.Maritim_Meta();//sekitar 4 menit
      console.log('maritim meta is running daily');
      await Daily_Task.Maritim_Viewboard();//sekitar 5 menit
      console.log('maritim viewboard is running daily');
    }
    if (project==='kaltim') {
      await Daily_Task.Laminetam();
      await Daily_Task.Cctvkaltim();
    }
  }

  async ManagemenExpiredData () {
    const threeDaysAgo = moment().subtract(3,'day').format("YYYY-MM-DDT23:59:59+07:00")
    let query = {externalDataToken:'enygma_sbkuyxsqp',"detail.Cross_Time":{$lte:threeDaysAgo}},
    collection = "externaldatas"
    return await Daily_Task.DeleteDataExpiredTime(query,collection)
  }

}

module.exports = Daily
