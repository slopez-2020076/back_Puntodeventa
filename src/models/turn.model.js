'use strict'


const mongoose = require('mongoose');
const turnSchema = mongoose.Schema({
    area: String,
    startTurn: Date,
    endTurn: Date,
    startDate: Date,
    endDate: Date,
    users:
    [{
        user: {type:mongoose.Schema.ObjectId, ref: 'User'}  
    }],
    branch:{ type: mongoose.Schema.ObjectId, ref: 'Branch' },
    company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('Turn', turnSchema);