'use strict'

const express = require('express');
const companyController = require('../controllers/company.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.get('/companyTest', companyController.companyTest);


//FUNCIONES PRIVADAS//
//CLIENT//
api.post('/register', companyController.register);
api.post('/login', companyController.login);
api.put('/update/:id', mdAuth.ensureAuth, companyController.update);
api.delete('/delete/:id', mdAuth.ensureAuth, companyController.deleteCompany);
api.get('/getBranches', mdAuth.ensureAuth, companyController.searchBranches);
api.get('/getBranch/:id', mdAuth.ensureAuth, companyController.searchBranch);


//FUNCIONES PRIVADAS DEL ADMIN//
api.post('/registerIsAdmin', mdAuth.ensureAuth, mdAuth.isAdmin, companyController.registerIsAdmin);
api.put('/updateIsAdmin/:id', mdAuth.ensureAuth, mdAuth.isAdmin, companyController.updateIsAdmin);
api.delete('/deleteIsAdmin/:id', mdAuth.ensureAuth, mdAuth.isAdmin, companyController.deleteCompanyIsAdmin);
api.get('/getCompanies', mdAuth.ensureAuth, mdAuth.isAdmin, companyController.searchCompanies);
api.get('/searchCompany/:id', mdAuth.ensureAuth, mdAuth.isAdmin, companyController.searchCompany);

api.get('/getBranchIsAdmin/:id', mdAuth.ensureAuth, mdAuth.isAdmin, companyController.searchBranchIsAdmin);
api.get('/getBranchesByCompanyAdmin/:id', mdAuth.ensureAuth, mdAuth.isAdmin, companyController.getBranchesByCompanyIsAdmin);


module.exports = api;