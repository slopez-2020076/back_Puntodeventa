'use strict'


const mongoose = require('mongoose');
const paymentSchema = mongoose.Schema({
    fechaPayment: Date,
    numeroDePago: Number,
    estadoPago: String,
    orden: { type: mongoose.Schema.ObjectId, ref: 'Orden' },
    typePayment:
        [{
            typePayment: { type: mongoose.Schema.ObjectId, ref: 'TypePayment' },
            name: String,
        }],

    //Efectivo
    montoEfectivo: Number,

    //Data de Tarjetas
    nombreDeLaTarjeta: String,
    numeroDeLaTarjeta: Number,
    fechaCaducidadTarjeta: Date,
    cantidadDePagos: Number,
    primerPagoParcial: Number,
    cadaPagoAdicional: Number,
    numeroDeAutorización: Number,

    
    //Cheque
    fechaDeVencimiento: Date,
    importe: Number,
    nombreDelBanco: String,
    cuenta: String,

    //Data De Dolares
    montoDolares: Number,


    Propinas: Number,
    Descuento: Number,
    Cambio: Number,
    Faltante: Number,
    Total: Number,
    Caja: { type: mongoose.Schema.ObjectId, ref: 'PaymentBox' }
});

module.exports = mongoose.model('Payment', paymentSchema);