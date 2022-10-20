'use strict'


const mongoose = require('mongoose');
const branchSchema = mongoose.Schema({

    name: String,
    phone: String, 
    address: String,
    company: {type: mongoose.Schema.ObjectId, ref : 'Company'},
    township: {type: mongoose.Schema.ObjectId, ref : 'Township'},

    products: [{
        product: {type: mongoose.Schema.ObjectId, ref: 'Product'},    
        name: String,
        price: Number,
        sales: Number,
    }],
});

module.exports = mongoose.model('Branch', branchSchema);