'use strict'


const mongoose = require('mongoose');
const cierreSchema = mongoose.Schema({
    
    EstadoDelDia: String,
    FechaDeApertura: Date,
    FechaDelCierre: Date,
    HoraCierreGeneral: Date,
    Caja :{ type: mongoose.Schema.ObjectId, ref: 'PaymentBox' },
    branch: { type: mongoose.Schema.ObjectId, ref: 'Branch' },
    CierresDelDia:
    [{
        FechaApertura: Date,
        FechaCierre: Date,
        No_Aligeramientos: Number,
        Fondo: Number,
        Efectivo: Number,
        Tarjeta: Number,
        Cheques: Number,
        AligeramientoVentas: Number,
        PagosVarios: Number,
        RetirosVueltos: Number,
        EnCaja: Number,

        TotalVisa: Number,
        TotalCredomatic: Number,
        TotalTajetas: Number,

        Dolares: Number,
        VueltosQuetzales: Number,

        TotalVentas: Number,
        TotalImpuestos: Number,
        TotalDescuentos: Number,
        TotalPropinas: Number,
        TotalCreditos: Number,
        Retiros: Number,
        CantidadFacturas: Number,
        CantidadRecibos: Number,
        InicioCaja: Number,
        FinalCierre: Number,
        Pagos: [{ type: mongoose.Schema.ObjectId, ref: 'Pagos' }],
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
            
    }],
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },

 
});

module.exports = mongoose.model('CierreSchema', cierreSchema);