'use strict';

//Importación de Mongoose
const mongoose = require('mongoose');

//Creación del Modelo Categoría
const categorySchema = mongoose.Schema({
        name: String,
        description: String 
    }
)

module.exports = mongoose.model('CategoryProduct', categorySchema);