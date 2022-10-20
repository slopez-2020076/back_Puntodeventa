'use strict'


const mongoose = require('mongoose');
const typePaymentSchema = mongoose.Schema({
    name: String,
    description: String,
    company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('TypePayment', typePaymentSchema);
