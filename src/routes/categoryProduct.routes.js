'use strict'

const express = require('express');
const categoryProductController = require('../controllers/categoryProduct.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/testCategoryProduct', mdAuth.ensureAuth, mdAuth.isAdmin, categoryProductController.testCategory);


//FUNCIONES PRIVADAS//
//TOWNSHIP//
api.post('/saveCategory', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryProductController.addCategory);
api.put('/updateCategory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryProductController.updateCategory);
api.get('/getCategories', mdAuth.ensureAuth, categoryProductController.getCategories);
api.get('/getCategory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryProductController.getCategory);
api.post('/getCategoryByNane', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryProductController.categoriesByName);
api.delete('/deleteCategory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], categoryProductController.deleteCategory);


module.exports = api;