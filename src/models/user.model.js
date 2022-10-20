'use strict'

const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
    phone: String,
    password: String,
    role: String,
    branch: { type: mongoose.Schema.ObjectId, ref: 'Branch' },
    company: { type: mongoose.Schema.ObjectId, ref: '"' }
});

module.exports = mongoose.model('User', userSchema);
