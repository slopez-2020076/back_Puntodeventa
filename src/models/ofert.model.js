'use strict'


const mongoose = require('mongoose');
const ofertSchema = mongoose.Schema({
    name: String,
    discount: Number,
    company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('Ofert', ofertSchema);