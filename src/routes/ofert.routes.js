'use strict'

const express = require('express');
const ofertController = require('../controllers/ofert.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/testOfert', mdAuth.ensureAuth, mdAuth.isAdmin, ofertController.testOfert);


//FUNCIONES PRIVADAS//
//TOWNSHIP//
api.post('/saveOfert', [mdAuth.ensureAuth, mdAuth.isAdmin], ofertController.saveOfert);
api.put('/updateOfert/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], ofertController.updateOfert);
api.get('/getOferts', mdAuth.ensureAuth, ofertController.getOferts);
api.get('/getOfert/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], ofertController.getOfert);
api.delete('/deleteOfert/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], ofertController.deleteOfert);


module.exports = api;