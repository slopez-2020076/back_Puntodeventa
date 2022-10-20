'use strict'

const express = require('express');
const typePaymentController = require('../controllers/typePayment.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/typePaymentTest',  mdAuth.ensureAuth, mdAuth.isAdmin, typePaymentController.testTypePayment);


//FUNCIONES PRIVADAS//
//Type Copmany//
api.post('/saveTypePayment', [mdAuth.ensureAuth, mdAuth.isAdmin], typePaymentController.saveTypePayment);
api.put('/updateTypePayment/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typePaymentController.updateTypePayment);
api.get('/getTypePayments', typePaymentController.getsTypePayments);
api.get('/getTypePayment/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typePaymentController.getTypePayment);
api.get('/getTypePaymentByCopmany/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typePaymentController.getTypepPaymentsByCompany);
api.delete('/deleteTypePayment/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typePaymentController.deleteTypePayment);

module.exports = api;