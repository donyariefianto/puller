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
    Route.delete('/delete-dataset','ExternalRequestController.RemoveAllDataset')
}).prefix('service/v1')

Route.get('/pbb_gresik','ExternalRequestController.pbb')
Route.get('/testing','ExternalRequestController.Testing')