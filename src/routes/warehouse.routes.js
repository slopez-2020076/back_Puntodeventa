'use strict'

const express = require('express');
const wareHouseController = require('../controllers/warehouse.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/wareHouseTest', mdAuth.ensureAuth, mdAuth.isAdmin, wareHouseController.wareHouseTest);


//FUNCIONES PRIVADAS//
//TOWNSHIP//
api.post('/saveWareHouse', [mdAuth.ensureAuth, mdAuth.isAdmin], wareHouseController.saveWarehouse);
api.put('/updateWareHouse/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], wareHouseController.updateWarehouse);
api.get('/getWareHouses', mdAuth.ensureAuth, wareHouseController.getsWarehouse);
api.get('/getWareHouse/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], wareHouseController.getWarehouse);
api.post('/getWareHouseByName', [mdAuth.ensureAuth, mdAuth.isAdmin], wareHouseController.warehouseByName);
api.get('/getWareHouseByBranch/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], wareHouseController.wareHouseByBranch);
api.delete('/deleteWareHouse/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], wareHouseController.deleteWarehouse);



module.exports = api;