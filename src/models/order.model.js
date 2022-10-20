'use strict'

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
{
    client: String,
    NIT: String,
    date: Date,
    state: String,
    NoPago: Number,
    user: {type:mongoose.Schema.ObjectId, ref: 'User'},
    branch: {type:mongoose.Schema.ObjectId, ref: 'Branch'},
    box: {type:mongoose.Schema.ObjectId, ref: 'Box'},
    typePayment:
    [{
        typePayment: {type:mongoose.Schema.ObjectId, ref: 'TypePayment'},
        name: String
    }],
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

module.exports = mongoose.model('Order', orderSchema);