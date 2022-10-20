'use strict';

const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
        name: String,
        surname: String,
        NIT: String,
        role: String,
        company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('Client', clientSchema);