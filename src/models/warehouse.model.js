'use strict'


const mongoose = require('mongoose');
const warehouseSchema = mongoose.Schema({

    name: String,
    description: String,
    address: String,
    branch: {type: mongoose.Schema.ObjectId, ref : 'Branch'},
    company: {type: mongoose.Schema.ObjectId, ref : 'Company'},
    
});

module.exports = mongoose.model('Warehouse', warehouseSchema);