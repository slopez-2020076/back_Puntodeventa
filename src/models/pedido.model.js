'use strict'


const mongoose = require('mongoose');
const orderInventorySchema = mongoose.Schema({
    dateOrder: Date,
    dateEstimated: Date,
    state: String,
    products: 
    [{
            product: {type:mongoose.Schema.ObjectId, ref: 'Product'}, 
            quantity: Number,
            price: Number,
            
    }],
    totalOrderInventory: Number,
    provider: { type: mongoose.Schema.ObjectId, ref: 'Provider' },
    branch: { type: mongoose.Schema.ObjectId, ref: 'Branch' },
    company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('OrderInventory', orderInventorySchema);