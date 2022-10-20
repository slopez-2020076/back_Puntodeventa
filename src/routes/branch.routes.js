'use strict'

const branchController = require('../controllers/branch.controller');
const express = require('express');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');


api.get('/testBranch', branchController.branchTest);
api.post('/saveBranch', mdAuth.ensureAuth, branchController.saveBranch);
api.put('/updateBranch/:id', mdAuth.ensureAuth, branchController.updateBranch);
api.delete('/deleteBranch/:id', mdAuth.ensureAuth, branchController.deleteBranch);

api.post('/addProduct/:id', mdAuth.ensureAuth, branchController.addProductBranch);
api.post('/deleteProduct/:id',mdAuth.ensureAuth, branchController.deleteProductBranch);
api.get('/getProductsBranch/:id', mdAuth.ensureAuth, branchController.getProductsBranch);
api.get('/getProductBranch/:id', mdAuth.ensureAuth, branchController.getProductBranch);
api.get('/getBranches', mdAuth.ensureAuth, branchController.getBranches);
api.get('/getBranch/:id', mdAuth.ensureAuth, branchController.getBranch);


module.exports = api; 