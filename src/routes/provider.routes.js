'use strict'

const express = require('express');
const providerController = require('../controllers/provider.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/providerTest', mdAuth.ensureAuth, mdAuth.isAdmin, providerController.testProvider);


//FUNCIONES PRIVADAS//
//TOWNSHIP//
api.post('/saveProvider', [mdAuth.ensureAuth, mdAuth.isAdmin], providerController.saveProvider);
api.put('/updateProvider/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], providerController.updateProvider);
api.get('/getProviders', mdAuth.ensureAuth, providerController.getProviders);
api.get('/getProvider/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], providerController.getProvider);
api.delete('/deleteProvider/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], providerController.deleteProvider);

api.post('/getProviderByName', [mdAuth.ensureAuth, mdAuth.isAdmin], providerController.getProviderByName);
api.post('/getProviderByNIT', [mdAuth.ensureAuth, mdAuth.isAdmin], providerController.getProviderByNIT);
api.get('/getProviderByCompany/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], providerController.getProvidersByCopmany);


module.exports = api;