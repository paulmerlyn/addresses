'use strict'

const path = require('path') // Must not move this require into server.js. Modules must stand alone.

const addressesController = require('./controllers/addressesController.js')

module.exports = (app, esClient) => {
  app.post('/v1.0/address', addressesController.createAddress(esClient))

  app.post('/v1.0/addresses', addressesController.createAddresses(esClient))

  app.delete('/v1.0/addresses', addressesController.deleteAllAddresses(esClient))

  app.get('/v1.0/addresses/match', addressesController.getMatchingAddresses(esClient))

  app.get('/v1.0/addresses', addressesController.getAllAddresses(esClient))

  app.get('/v1.0/addresses/count', addressesController.getAddressCount(esClient))

  app.delete('/v1.0/addresses/:id', addressesController.deleteAddress(esClient))

  app.get('/v1.0/addresses/:id', addressesController.getAddress(esClient))

  app.patch('/v1.0/addresses/:id', addressesController.updateAddress(esClient))

  /* This catch-all route must come after all other routes. */
  app.get('/*', (req, res) => {
    console.log('Server is attempting to send static/index.html from catch-all route.')
    res.sendFile(path.resolve('./static/custom404.html'))
  })
}
