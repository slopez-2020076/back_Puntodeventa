'use strict'


const mongoose = require('mongoose');
const inventorySchema = mongoose.Schema({
    name: String,
    description: String,
    price: Number,  
    stock: Number,
    typeProduct: String,
    codeBar: String,
    provider: { type: mongoose.Schema.ObjectId, ref: 'Provider' },
    warehouse: { type: mongoose.Schema.ObjectId, ref: 'Warehouse' },
    
});

module.exports = mongoose.model('Inventory', inventorySchema);