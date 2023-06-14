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
    Route.put('/update-dataset','ExternalRequestController.UpdateAllDataset')
    Route.delete('/delete-dataset','ExternalRequestController.RemoveAllDataset')
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

    Route.get('/artemis-fr/getAllTreeCode','ArtemisFrController.getAllTreeCode')
    Route.get('/artemis-fr/regions','ArtemisFrController.regions')
    Route.get('/artemis-fr/regions_root','ArtemisFrController.regions_root')

}).prefix('service/v1')

Route.get('/pbb_gresik','ExternalRequestController.pbb')
Route.get('/testing','ExternalRequestController.Testing')
Route.get('/testing2','ExternalRequestController.TixId')
Route.get('/cctv-kaltim','ExternalRequestController.GenerateCctvKaltim')
Route.get('/laminetam','ExternalRequestController.GetLaminetam')
Route.get('/siskaperbapo','ExternalRequestController.GenerateSiskaperbapo')
Route.get('/siskaperbapo-area','ExternalRequestController.GenerateSiskaperbapoArea')
Route.get('/all-cities','ExternalRequestController.AllCity')