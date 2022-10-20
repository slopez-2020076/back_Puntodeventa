'use strict';


//Importación de los Modelos -Productos-
const Products = require('../models/product.model');

//Importación del Modelo -Orden-
const Order = require('../models/order.model');
const Payment = require('../models/payments.model')
const TypePayment = require('../models/typePayment.model');

const { validateData, detailsShoppingCart } = require('../utils/validate');
const { createConversion } = require('../middlewares/convert');
const paymentBoxModel = require('../models/paymentBox.model');


//Función de testeo de Pago 
exports.testOrder = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}


//Función para realizar un Pago//
exports.createPayment = async (req, res) => {
    try {
        const params = req.body;
        const OrdenID = window.location.hash;

        const date = new Date();
        const dateLocal = (date).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitDate = dateLocal.split(' ');
        const splitDateOne = splitDate[0].split('/');
        if (splitDateOne[0] < 10) {
            splitDateOne[0] = '0' + splitDateOne[0];
        }
        if (splitDateOne[1] < 10) {
            splitDateOne[1] = '0' + splitDateOne[1];
        }
        const setDate = splitDateOne[2] + '-' + splitDateOne[1] + '-' + splitDateOne[0];
        const setDateOrder = new Date(setDate);


        //Verificacion de Ecistencia de la Orden
        const ordenExist = await Order.findOne({ _id: OrdenID });
        if (!ordenExist) return res.send({ message: "Orden not found" });

        const cajaExist = await paymentBoxModel.findOne({ _id: ordenExist.box });
        if (!cajaExist) return res.send({ message: "Caja no Existe." });



        const data = {
            fechaPayment: setDateOrder,
            numeroDePago: ordenExist.NoPago,
            estadoPago: "PENDIENTE",
            orden: OrdenID,
            typePayment: ordenExist.typePayment,
            Cambio: 0,
            Faltante: ordenExist.total,
            Total: ordenExist.total,
            Caja: cajaExist._id
        };


        //Validación de existencia de un metodo de pago//
        if (ordenExist.typePayment.length == 0) return res.send({ message: "No se agregó ningun metodo de Pago." });
        const arrayTypePayment = ordenExist.typePayment;
        for (typePay of arrayTypePayment) {

            const typePayment = await TypePayment.findOne({ _id: typePay._id });
            if (!typePayment) return res.send({ message: "Tipo de Pago no encontrado" });


            if (typePay.name === "EFECTIVO") {
                data.montoEfectivo = 0
            }
            if (typePay.name === "TARJETA") {
                data.nombreDeLaTarjeta = "",
                    data.numeroDeLaTarjeta = 0,
                    data.fechaCaducidadTarjeta = null,
                    data.cantidadDePagos = 0,
                    data.primerPagoParcial = 0,
                    data.cadaPagoAdicional = 0,
                    data.numeroDeAutorización = 0
            }
            if (typePay.name === "CHEQUE") {
                data.fechaDeVencimiento = null,
                    data.importe = 0,
                    data.nombreDelBanco = "",
                    data.cuenta = ""
            }
            if (typePay.name === "DOLARES") {
                data.montoDolares = 0
            }
        }


        //Creación del Pago
        const addPayment = new Payment(checkdata);
        await addPayment.save();

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando el Pago.' });
    }
}






//Funcion para agregar un Descuento al Pago// 
exports.addDiscount = async (req, res) => {
    try {
        const PaymentID = req.params.id;
        const params = req.body;
        const data = {
            discount: params.discount,

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //Validación de que la oferta no sea mayor a 100
        if (data.discount > 100) return res.send({ message: "The value of the discount cannot exceed 100%." })


        //Validación de que la oferta no sea menor a 0
        if (data.discount < 0) return res.send({ message: "The value of the discount cannot 0." });


        //Verificar que Exista el Pago //
        const payExist = await Payment.findOne({ _id: PaymentID });
        if (!payExist) return res.status(400).send({ message: 'Pago no encontrado.' });

        if(payExist.estadoPago == "PENDIENTE"){

            const orderExist = await Order.findOne({ _id: payExist.orden });
            if (!orderExist) return res.send({ message: "Orden no encontrada." })
            const quantity = (data.discount * payExist.Total) / 100;
            const totalDiscount = payExist.Total - quantity;
            const totalFaltante = payExist.Faltante - quantity;
    
    
            const newTotal = await Payment.findOneAndUpdate({ _id: payExist._id }, { Descuento: quantity, Total:totalDiscount, Faltante: totalFaltante },
                { new: true });
    
            //Agregando la Descuento a la orden
            const discount = await detailsShoppingCart(payExist._id);
            return res.send({ message: 'Added New Discount to Pay.', discount });

        }else{
            return res.send({message: "El pago ya ha sido cancelado."})
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding Discount.' });
    }
}



//Funcion para agregar una Propina al Pago// 
exports.addPropina = async (req, res) => {
    try {
        const PaymentID = req.params.id;
        const params = req.body;
        const data = {
            discount: params.discount,

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //Validación de que la oferta no sea mayor a 100
        if (data.discount > 100) return res.send({ message: "The value of the discount cannot exceed 100%." })


        //Validación de que la oferta no sea menor a 0
        if (data.discount < 0) return res.send({ message: "The value of the discount cannot 0." });


        //Verificar que Exista el Pago //
        const payExist = await Payment.findOne({ _id: PaymentID });
        if (!payExist) return res.status(400).send({ message: 'Pago no encontrado.' });



        if (payExist.estadoPago == "PENDIENTE") {

            const orderExist = await Order.findOne({ _id: payExist.orden });
            if (!orderExist) return res.send({ message: "Orden no encontrada." })
            const quantity = (data.discount * payExist.Total) / 100;
            const totalDiscount = payExist.Total + quantity;
            const totalFaltante = payExist.Faltante + quantity;


            const newTotal = await Payment.findOneAndUpdate({ _id: payExist._id }, { Propinas: quantity, Total: totalDiscount, Faltante: totalFaltante },
                { new: true });

            //Agregando la Descuento a la orden
            const discount = await detailsShoppingCart(payExist._id);
            return res.send({ message: 'Added New Propina to Pay.', discount });

        } else {
            return res.send({message: "El pago ya ha sido cancelado."})
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error agregando Propina.' });
    }
}




//Funcion para setear el descuento al Pago//
exports.setDiscount = async (req, res) => {
    try {
        const PaymentID = req.params.id;

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Pago//
        const payExist = await Payment.findOne({ _id: PaymentID });
        if (!payExist) return res.status(400).send({ message: 'Payment not found. ' });

        if (payExist.estadoPago == "PENDIENTE") {
            //Busqueda de la orden del pago//
            const dataOrder = await Order.findOne({ _id: payExist.orden });


            //Array de las ofertas de cada orden
            const dataTypePayment = payExist.typePayment;
            for (dataTypePay of dataTypePayment) {

                const typePayment = await TypePayment.findOne({ _id: dataTypePayment._id });
                if (!typePayment) return res.send({ message: "Tipo de Pago no encontrado" });


                if (dataTypePay.name === "EFECTIVO") {
                    const montoEfect = 0
                    const newSetData = await Payment.findOneAndUpdate({ _id: payExist._id },
                        { montoEfectivo: montoEfect }, { new: true });
                }
                if (dataTypePay.name === "TARJETA") {
                    const nombreDeLaTarj = "";
                    const numDeLaTarjeta = 0;
                    const fechaCaducidadTarj = null;
                    const cantidadDePag = 0;
                    const primerPagoPar = 0;
                    const cadaPagoAdic = 0;
                    const numeroDeAuto = 0;
                    const newSetData = await Payment.findOneAndUpdate({ _id: payExist._id },
                        {
                            nombreDeLaTarjeta: nombreDeLaTarj, numeroDeLaTarjeta: numDeLaTarjeta, fechaCaducidadTarjeta: fechaCaducidadTarj,
                            cantidadDePagos: cantidadDePag, primerPagoParcial: primerPagoPar, cadaPagoAdicional: cadaPagoAdic,
                            numeroDeAutorización: numeroDeAuto
                        },
                        { new: true });
                }
                if (dataTypePay.name === "CHEQUE") {
                    const fechaDeVencimi = null;
                    const impor = 0;
                    const nombreDelBanc = "";
                    const cuenta = "";
                    const newSetData = await Payment.findOneAndUpdate({ _id: payExist._id },
                        {
                            fechaDeVencimiento: fechaDeVencimi, importe: impor, nombreDelBanco: nombreDelBanc,
                            cuenta: cuenta
                        },
                        { new: true });
                }
                if (dataTypePay.name === "DOLARES") {
                    data.montoDol = 0
                    const newSetData = await Payment.findOneAndUpdate({ _id: payExist._id },
                        { montoDolares: montoDol },
                        { new: true });
                }
            }

            const propina = 0;
            const descuento = 0;
            const cambio = 0;
            const faltante = dataOrder.total;
            const total = dataOrder.total;

            //Seteo de los datos
            const newSetData = await Payment.findOneAndUpdate({ _id: payExist._id },
                { Propinas: propina, Descuento: descuento, Cambio: cambio, Faltante: faltante, Total: total },
                { new: true });
            return res.send({ message: 'Pago Reseteado', newSetData });
        } else {
            returnres.send({ message: "El Pago ya ha sido Cancelado." })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error reseteando el Pago.' });
    }
}






//Funcion para Pagar en Dolares// 
exports.addPayDolares= async (req, res) => {
    try {
        const PaymentID = req.params.id;
        const params = req.body;
        const data = {
            montoDolares: params.montoDolares,
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que Exista el Pago //
        const payExist = await Payment.findOne({ _id: PaymentID });
        if (!payExist) return res.status(400).send({ message: 'Pago no encontrado.' });

        if (payExist.estadoPago == "PENDIENTE") {
       
           
            //Validación de que la cantidad del Pago no sea menor a 0
            if (data.montoDolares <= 0) return res.send({ message: "El valor del pago debe ser mayor a 0." });
            const cambio = createConversion(montoDolares);
            

            //Validación de que la cantidad no sea mayor al 100% de el Pago
            if (cambio > payExist.Total){
                const totalPayEfectivo = payExist.Total - cambio;
                const cambio = totalPayEfectivo*-1;
                const newTotalCambio = await Payment.findOneAndUpdate({ _id: payExist._id }, { Total: 0 }, {Cambio: totalPayEfectivo},
                    { new: true });

                const updateEstadoPago = await Payment.findOneAndUpdate({_id: payExist._id}, {estadoPago: "CANCELADO"}, {new: true});
                return res.send({ message: "El total del pago ha sido Cancelado.", updateEstadoPago, cambio});
            }
            
            if(cambio <= payExist.Total){
                const totalPayEfectivoPo = payExist.Total - cambio;
                const newTotal = await Payment.findOneAndUpdate({ _id: payExist._id }, { Total: totalPayEfectivoPo },
                    { new: true });

                if (payExist.Total != 0) {
                    const updateFaltante = await Payment.findOneAndUpdate({ _id: payExist._id }, { Faltante: totalPayEfectivPo }, { new: true });
                    return res.send({ message: "Cantidad faltante a pagar: ", totalPayDolar });
    
                } else {
                    const updateEstadoPago = await Payment.findOneAndUpdate({_id: payExist._id}, {estadoPago: "CANCELADO"}, {new: true});
                    return res.send({ message: "El total del pago ha sido Cancelado.", updateEstadoPago });
                }
            } 
            const updateMontoDolar = await Payment.findOneAndUpdate({_id: payExist._id}, {montoDolares: data.montoDolares}, {new: true});
        } else {
            return res.send({ message: "El pago ya ha sido Cancelado." })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando Pago en Dolares.' });
    }
}




//Funcion para Pagar en Efectivo// 
exports.addPayEfectivo = async (req, res) => {
    try {
        const PaymentID = req.params.id;
        const params = req.body;
        const data = {
            montoEfectivo: params.montoEfectivo,

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que Exista el Pago //
        const payExist = await Payment.findOne({ _id: PaymentID });
        if (!payExist) return res.status(400).send({ message: 'Pago no encontrado.' });

        if (payExist.estadoPago == "PENDIENTE") {
       
           
            //Validación de que la cantidad del Pago no sea menor a 0
            if (data.montoEfectivo <= 0) return res.send({ message: "El valor del pago debe ser mayor a 0." });
            
            //Validación de que la cantidad no sea mayor al 100% de el Pago
            if (data.montoEfectivo > payExist.Total){
                const totalPayEfectivo = payExist.Total - data.montoEfectivo;
                const cambio = totalPayEfectivo*-1;
                const newTotalCambio = await Payment.findOneAndUpdate({ _id: payExist._id }, { Total: 0 }, {Cambio: totalPayEfectivo},
                    { new: true });

                const updateEstadoPago = await Payment.findOneAndUpdate({_id: payExist._id}, {estadoPago: "CANCELADO"}, {new: true});
                return res.send({ message: "El total del pago ha sido Cancelado.", updateEstadoPago, cambio});
            }
            
            if(data.montoEfectivo <= payExist.Total){
                const totalPayEfectivoPo = payExist.Total - data.montoEfectivo;
                const newTotal = await Payment.findOneAndUpdate({ _id: payExist._id }, { Total: totalPayEfectivoPo },
                    { new: true });

                if (payExist.Total != 0) {
                    const updateFaltante = await Payment.findOneAndUpdate({ _id: payExist._id }, { Faltante: totalPayEfectivo }, { new: true });
                    return res.send({ message: "Cantidad faltante a pagar: ", totalPayDolar });
    
                } else {
                    const updateEstadoPago = await Payment.findOneAndUpdate({_id: payExist._id}, {estadoPago: "CANCELADO"}, {new: true});
                    return res.send({ message: "El total del pago ha sido Cancelado.", updateEstadoPago });
                }
            } 
            const updateMontoEfectivo  = await Payment.findOneAndUpdate({_id: payExist._id}, {montoEfectivo: data.montoEfectivo}, {new: true});
        } else {
            return res.send({ message: "El pago ya ha sido Cancelado." })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding Propina.' });
    }
}





//Funcion para Pagar en Cheques// 
exports.addPayCheque= async (req, res) => {
    try {
        const PaymentID = req.params.id;
        const params = req.body;
        const dateVencimiento = new Date(params.fechaDeVencimiento);

        const date = new Date();
        const dateLocal = (date).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitDate = dateLocal.split(' ');
        const splitDateOne = splitDate[0].split('/');
        if (splitDateOne[0] < 10) {
            splitDateOne[0] = '0' + splitDateOne[0];
        }
        if (splitDateOne[1] < 10) {
            splitDateOne[1] = '0' + splitDateOne[1];
        }
        const setDate = splitDateOne[2] + '-' + splitDateOne[1] + '-' + splitDateOne[0];
        const setDateOrder = new Date(setDate);


        const data = {
            fechaDeVencimiento: params.fechaDeVencimiento,
            importe: params.importe,
            nombreDelBanco: params.nombreDelBanco,
            cuenta: params.cuenta

        };

        //Validación de la fecha de Vencimiento//
        if (dateVencimiento < setDateOrder) return res.status(400).send({ message: 'La fecha de vencimiento no es valida.' })


        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que Exista el Pago //
        const payExist = await Payment.findOne({ _id: PaymentID });
        if (!payExist) return res.status(400).send({ message: 'Pago no encontrado.' });


        if (payExist.estadoPago == "PENDIENTE") {
       
           
            //Validación de que la cantidad del Pago no sea menor a 0
            if (data.importe <= 0) return res.send({ message: "El valor del pago debe ser mayor a 0." });

            //Validación de que la oferta no sea mayor a 100
            if (data.importe > payExist.Total) return res.send({ message: "El valor del Pago no debe pasar la cantidad de Pago total." });
 
            
            //Realización del Pago//
            
            const totalImporte = payExist.Total - data.importe;
            const newTotal = await Payment.findOneAndUpdate({ _id: payExist._id }, { Total: totalImporte},
                { new: true });

            if (payExist.Total != 0) {
                const updateFaltante = await Payment.findOneAndUpdate({ _id: payExist._id }, { Faltante: totalImporte }, { new: true });
                return res.send({ message: "Cantidad faltante a pagar: ", totalImporte });

            } 
            if(payExist.Total == 0) {
                const updateEstadoPago = await Payment.findOneAndUpdate({ _id: payExist._id }, { estadoPago: "CANCELADO" }, { new: true });
                return res.send({ message: "El total del pago ha sido Cancelado.", updateEstadoPago });
            }
            
            const updateDataCheque  = await Payment.findOneAndUpdate({_id: payExist._id}, {fechaDeVencimiento: data.fechaDeVencimiento, 
                importe: data.importe, nombreDelBanco: data.nombreDelBanco, cuenta: data.cuenta}, {new: true});

        } else {
            return res.send({ message: "El pago ya ha sido Cancelado." })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando Pago en cheque.' });
    }
}





//Funcion para Pagar con Tarjeta// 
exports.addPayTarjeta= async (req, res) => {
    try {
        const PaymentID = req.params.id;
        const params = req.body;
        const data = {
            nombreDeLaTarjeta: 7,
            numeroDeLaTarjeta: Number,
            fechaCaducidadTarjeta: Date,
            cantidadDePagos: Number,
            primerPagoParcial: Number,
            cadaPagoAdicional: Number,
            numeroDeAutorización: Number,
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que Exista el Pago //
        const payExist = await Payment.findOne({ _id: PaymentID });
        if (!payExist) return res.status(400).send({ message: 'Pago no encontrado.' });

        if (payExist.estadoPago == "PENDIENTE") {
       
           
            //Validación de que la cantidad del Pago no sea menor a 0
            if (data.montoDolares <= 0) return res.send({ message: "El valor del pago debe ser mayor a 0." });
            const cambio = createConversion(montoDolares);
            

            //Validación de que la cantidad no sea mayor al 100% de el Pago
            if (cambio > payExist.Total){
                const totalPayEfectivo = payExist.Total - cambio;
                const cambio = totalPayEfectivo*-1;
                const newTotalCambio = await Payment.findOneAndUpdate({ _id: payExist._id }, { Total: 0 }, {Cambio: totalPayEfectivo},
                    { new: true });

                const updateEstadoPago = await Payment.findOneAndUpdate({_id: payExist._id}, {estadoPago: "CANCELADO"}, {new: true});
                return res.send({ message: "El total del pago ha sido Cancelado.", updateEstadoPago, cambio});
            }
            
            if(cambio <= payExist.Total){
                const totalPayEfectivoPo = payExist.Total - cambio;
                const newTotal = await Payment.findOneAndUpdate({ _id: payExist._id }, { Total: totalPayEfectivoPo },
                    { new: true });

                if (payExist.Total != 0) {
                    const updateFaltante = await Payment.findOneAndUpdate({ _id: payExist._id }, { Faltante: totalPayEfectivPo }, { new: true });
                    return res.send({ message: "Cantidad faltante a pagar: ", totalPayDolar });
    
                } else {
                    const updateEstadoPago = await Payment.findOneAndUpdate({_id: payExist._id}, {estadoPago: "CANCELADO"}, {new: true});
                    return res.send({ message: "El total del pago ha sido Cancelado.", updateEstadoPago });
                }
            } 
            const updateMontoDolar = await Payment.findOneAndUpdate({_id: payExist._id}, {montoDolares: data.montoDolares}, {new: true});
        } else {
            return res.send({ message: "El pago ya ha sido Cancelado." })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando Pago en Dolares.' });
    }
}