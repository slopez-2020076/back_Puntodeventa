'use strict'

const express = require('express');
const clientController = require('../controllers/client.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.post('/saveClient', [mdAuth.ensureAuth, mdAuth.isUser], clientController.AddClient);
api.get('/getClientsByCompany', mdAuth.ensureAuth, clientController.getClientsByCompany);
api.post('/getClientsByName', mdAuth.ensureAuth, clientController.getClientByName);
api.post('/getClientsByNIT', mdAuth.ensureAuth, clientController.getClientNIT);
api.delete('/deleteClient/:id', [mdAuth.ensureAuth, mdAuth.isUser], clientController.deleteUser);
api.put('/updateClient/:id', [mdAuth.ensureAuth], clientController.updateClient);

//FUNCIONES PRIVADAS//
//CLIENT//
api.get('/testClient', mdAuth.ensureAuth, mdAuth.isAdmin, clientController.clientTest);
api.get('/getClient/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], clientController.getClient);
api.get('/getClients', [mdAuth.ensureAuth, mdAuth.isAdmin], clientController.getClients);


module.exports = api;