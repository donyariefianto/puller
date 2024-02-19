'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
    Route.get('/maritim-viewboard','ExternalRequestController.GetMaritimViewboard')
    Route.get('/maritim-meta','ExternalRequestController.GetMaritimMeta')
    Route.get('/maritim-area','ExternalRequestController.GetMaritimArea')
    Route.get('/generate-anpr','ExternalRequestController.GetAnpr')
    Route.get('/generate-anpr-dataset','ExternalRequestController.GnerateDatasetAnpr')
    Route.put('/update-dataset','ExternalRequestController.UpdateAllDataset')
    Route.delete('/delete-dataset','ExternalRequestController.RemoveAllDataset')
    Route.delete('/delete-pilihsiapa','ExternalRequestController.RemovePilihSaiapa')
    Route.get('/generate-kai-route','ExternalRequestController.KaiRoute')
    Route.delete('/deleteBy-user','ExternalRequestController.DeleteByUser')

    // MEDIA TOOL
    Route.get('/media-keyword','DetermController.ListKeyword')
    Route.get('/media-list','DetermController.MediaTool')
    Route.get('/media-feed','DetermController.MediaTool')
    Route.get('/media-reaction','DetermController.ReactionMediatoolkit')
    Route.get('/list-cam','ExternalRequestController.list_cam') 
    Route.get('/overview-cam','ExternalRequestController.Vehicle_Record_Overview')
    Route.get('/record5m-cam','ExternalRequestController.Vehicle_Record')
    Route.get('/backup-artemis','ExternalRequestController.BackupDailyArtemis')

    Route.get('/artemis-fr/getAllTreeCode','ArtemisFrController.getAllTreeCode')
    Route.get('/artemis-fr/regions','ArtemisFrController.regions')
    Route.get('/artemis-fr/regions_root','ArtemisFrController.regions_root')
    Route.get('/artemis-fr/fivemin','ArtemisFrController.Get5')
    
    Route.post('/logs','ExternalRequestController.GetLog')
    Route.put('/custom-update','ExternalRequestController.UpdateDataCustom')
    Route.delete('/custom-delete','ExternalRequestController.DeleteDataCustom')

    // WHALE 
    const whale = "whale"
    Route.post(whale + '/dashboard','WhaleController.ProccessDashboard')
    Route.post(whale + '/unique-enters','WhaleController.UniqueEnters')
    Route.post(whale + '/entry-rate','WhaleController.EntryRate')
    Route.post(whale + '/highlights-passersby','WhaleController.HighlightsPassersby')
    Route.post(whale + '/customer-demographics','WhaleController.CustomerDemographichs')
    Route.post(whale + '/entry-group','WhaleController.EntryGroups')

}).prefix('service/v1')

Route.group(() => {
    Route.get('record-data','AnprController.AnprRecordByTime')
    Route.get('record-picture','AnprController.AnprRecordPicture')
}).prefix("/anpr/")

Route.get('/dashboard','ExternalRequestController.MQTT')
Route.get('/logs','ExternalRequestController.Logs')
Route.get('/logs/:id','ExternalRequestController.LogStatistik')
Route.get('/pbb_gresik','ExternalRequestController.pbb')
Route.get('/testing','ExternalRequestController.test')
Route.get('/testing2','ExternalRequestController.TixId')
Route.get('/cctv-kaltim','ExternalRequestController.GenerateCctvKaltim')
Route.get('/laminetam','ExternalRequestController.GetLaminetam')
Route.get('/monipad','ExternalRequestController.Monipad')
Route.get('/siskaperbapo','ExternalRequestController.GenerateSiskaperbapo')
Route.get('/siskaperbapo-area','ExternalRequestController.GenerateSiskaperbapoArea')
Route.get('/all-cities','ExternalRequestController.AllCity')
Route.get('/pilih-siapa','ExternalRequestController.pilihSiapaPoint')
Route.get('/pilih-answer','ExternalRequestController.pilihSiapaAnswer')
Route.get('/pilih-answer2','ExternalRequestController.pilihSiapaAnswer2')
Route.get('/pilih-question','ExternalRequestController.pilihSiapaQuestion')
Route.get('/pilih-claim','ExternalRequestController.pilihSiapaClaim')
Route.get('/surveyor-count','ExternalRequestController.CountSurveyor')
Route.delete('/delete-collection','ExternalRequestController.DeleteCollection')
Route.get('/test','ExternalRequestController.Testing')
Route.get('/find-location','ExternalRequestController.CheckLocation')
Route.get('/deleteartemis-prevmonth','ArtemisFrController.DeletePrevMonth')