'use strict'

const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/testInventory', mdAuth.ensureAuth, mdAuth.isAdmin, inventoryController.testInventory);


//FUNCIONES PRIVADAS//
//Inventory//
api.post('/saveInventory', [mdAuth.ensureAuth, mdAuth.isAdmin], inventoryController.addProductInventory);
api.put('/updateProductInventory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], inventoryController.updateProductInventory);
api.get('/getProductsInventory', mdAuth.ensureAuth, inventoryController.getInventories);
api.get('/getInventory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], inventoryController.getInventory);
api.post('/getInventoryByName', [mdAuth.ensureAuth, mdAuth.isAdmin], inventoryController.searchProductNameInventory);
api.get('/getInventoryByProvider/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], inventoryController.searchProductProvider);
api.get('/getInventoryByWarehouse/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], inventoryController.searchProductWarehouse);
api.delete('/deleteInventory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], inventoryController.deleteProductInventory);



module.exports = api;