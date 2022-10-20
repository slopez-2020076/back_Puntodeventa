'use strict'

const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
{
    client: String,
    NIT: String,
    date: Date,
    state: String,
    user: {type:mongoose.Schema.ObjectId, ref: 'User'},
    branch: {type:mongoose.Schema.ObjectId, ref: 'Branch'},
    products: 
    [{
            product: {type:mongoose.Schema.ObjectId, ref: 'Product'}, 
            quantity: Number,
            price: Number,
            subTotalProduct: Number
            
    }],
    IVA: Number,
    subTotal: Number,
    total: Number,
});

module.exports = mongoose.model('Bill', billSchema);