'use strict'

const express = require('express');
const productController = require('../controllers/product.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/testProduct', mdAuth.ensureAuth, mdAuth.isAdmin, productController.testProduct);


//FUNCIONES PRIVADAS//
//Inventory//
api.post('/saveProduct', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.saveProduct);
api.post('/addProductInventory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.addOProdcutCorre);
api.put('/updateProduct/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.updateProduct);


api.get('/getProducts', mdAuth.ensureAuth, productController.getProducts);
api.get('/getProduct/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.getProduct);
api.get('/getProductExhausted', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.exhaustedProducts);
api.get('/getPopularProducts', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.popularProducts);
api.get('/getProductForCategoryID/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.productsForCategoryID);
api.post('/getProductForCategoryName', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.productsForCategoryName);
api.post('/getProductByName', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.searchProductByName);
api.post('/addOfertToProduct/:id',  [mdAuth.ensureAuth, mdAuth.isAdmin], productController.addOfert);
api.delete('/deleteOfertToProduct/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.deleteOfert); 
api.delete('/deleteProductInventory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.DeleteProductInventory);
api.delete('/deleteProduct/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], productController.deleteProduct);



module.exports = api;