'use strict'


const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    name: String,
    description: String,
    sales: Number,
    typeProduct: String,
    presentation: String,
    codeBar: String,
    oferts: 
    [{
        ofert: {type: mongoose.Schema.ObjectId, ref : 'Ofert'},
        discount: Number,
        quantityRested: Number
    }],
    category: {type: mongoose.Schema.ObjectId, ref : 'CategoryProduct'},
    inventorys: 
    [{
            inventory: {type:mongoose.Schema.ObjectId, ref: 'Inventory'}, 
            quantity: Number,
            price: Number,
            totalPriceProducts: Number
    }],
    TotalPrice: Number,
    branch:{ type: mongoose.Schema.ObjectId, ref: 'Branch' },
    company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('Product', productSchema);