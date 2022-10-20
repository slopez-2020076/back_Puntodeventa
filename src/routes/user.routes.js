'use strict'

const express = require('express');
const userController = require('../controllers/user.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//FUNCIÓN PÚBLICA
api.post('/login', userController.login);


//FUNCIONES PRIVADAS//
//FUNCIONES DEL GERENTE//
api.post('/saveUserAdmin', [mdAuth.ensureAuth, mdAuth.isGerent], userController.AddUserByAdminCompany);
api.post('/searchUserByName', [mdAuth.ensureAuth, mdAuth.isGerent], userController.searchUserByName);
api.put('/updateUser/:id', [mdAuth.ensureAuth, mdAuth.isGerent], userController.updateAccount);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.isGerent], userController.getUsers);
api.delete('/deleteUser/:id', [mdAuth.ensureAuth, mdAuth.isGerent], userController.deleteUser);


//FUNCIONES DEL ADMIN//
api.get('/userTest', mdAuth.ensureAuth, mdAuth.isAdmin, userController.userTest);
api.get('/getUserByAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUserByAdmin);
api.get('/getUsersByCompanyByAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUsersCompanyByAdmin);
api.get('/getUsersByAdmin', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUsersByAdmin);
api.post('/searchUserByNameByAdmin', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.searchUserByNameByAdmin);
api.post('/saveUser', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.AddUserByAdmin);
api.post('/changePassword/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.changePasswordByAdmin);
api.put('/updateUserByAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.updateAccountByAdmin);
api.delete('/deleteUserByAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.deleteUserByAdmin);



module.exports = api;