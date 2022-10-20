'use strict'


const mongoose = require('mongoose');
const providerSchema = mongoose.Schema({
    name: String,
    address: String,
    NIT: String,
    contact: String,
    email: String,
    company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('Provider', providerSchema);