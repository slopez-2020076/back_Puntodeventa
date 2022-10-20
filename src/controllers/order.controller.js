'use strict';


//Importación de los Modelos -Productos-
const Products = require('../models/product.model');

//Importación del Modelo -Orden-
const Order = require('../models/order.model');
const Ofert = require('../models/order.model'); 
const TypePayment = require('../models/typePayment.model');

//Importación del Reporte en PDF de la Factura//
const {createPayment} = require('./payment.controller');

const { validateData, detailsShoppingCart } = require('../utils/validate');


//Función de testeo de Orden 
exports.testOrder = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}


//Función para enviar una Orden
exports.saveOrder = async (req, res) => {
    try {
        const user = req.user.sub;
        const params = req.body;

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

        const userExist = req.user.sub;
        const companyExist = await Company.findOne({ _id: userExist.company });
        if (!companyExist) return res.send({ message: "Company not found" });

        const branchExist = await Branch.findOne({ _id: userExist.branch });
        if (!branchExist) return res.send({ message: "Branch not found" });

        //Generador de Codigos de Pago
        const numPay = await Order.count().lean();


        //Funcion de la caja
        const boxUser = await PaymentBox.findOne({ user: userExist });
        if (!boxUser) return res.send({ message: "Box not found" });

        const data = {
            client: params.client,
            NIT: params.NIT,
            date: setDateOrder,
            state: "On Going",
            NoPago: numPay + 1000,
            user: req.user.sub,
            branch: branchExist,
            box: boxUser,
            typePayment: params.typePayment,
            IVA: 0,
            subTotal: 0,
            total: 0,
        };

        //Verificar la La empresa//
        const verificCompany = await Company.findOne({ _id: userExist.company })
        if (!verificCompany) return res.status(400).send({ message: 'Company not found.' });

        //Verificación de NIT
        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) { checkdata.NIT = 'C/F' }
        else { checkdata.NIT = params.NIT }


        //Creación de Orden
        const addOrder = new Order(checkdata);
        await addOrder.save();

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando la La Orden.' });
    }
}




//Funcion para agregar un Tipo De Pago a la orden 
exports.addTypePayment = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;

        const data = {
            typePayment: params.typePayment
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Tipo de Pago//
        const typePaymentExist = await TypePayment.findOne({ _id: params.typePayment });
        if (!typePaymentExist) return res.status(400).send({ message: 'Tipo de Pago not found' });


        //Verificar que Exista la Orden //
        const OrderExist = await Order.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'Order not found' });

        //Validación que no sea mayor a 3
        if (OrderExist.typePayment.count > 3) return res.status(400).send({ message: 'El tipo de Pago no pueden ser mayor a 2' })

        //Seteo de datos del producto
        const setTypePayment =
        {
            typePayment: data.typePayment,
            name: typePaymentExist.name
        }


        //Array de los tipos de Pago existentes en la Orden
        const payments = Order.typePayment;
        for (inven of payments) {

            if (inven._id == typePaymentExist._id) return res.send({ message: "El tipo de Pago ya fue elegido." });
            if (inven._id != typePaymentExist._id) continue;
        }

        const newTypePayment = await Order.findOneAndUpdate({ _id: OrderExist._id },
            { $push: { typePayment: setTypePayment } }, { new: true });

        //Agregando el tipo de Pago a la orden
        const payment = await detailsShoppingCart(OrderExist._id);
        return res.send({ message: 'Added New TypePayment to Order.', payment })


    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error agregando el tipo de Pago.' });
    }
}



//Funcion para eliminar un Tipo De Pago a la orden 
exports.deleteTypePayment = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;

        const data = {
            typePayment: params.typePayment
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Tipo de Pago//
        const typePaymentExist = await TypePayment.findOne({ _id: params.typePayment });
        if (!typePaymentExist) return res.status(400).send({ message: 'Tipo de Pago not found' });


        //Verificar que Exista la Orden //
        const OrderExist = await Order.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'Order not found' });

        //Validación que no sea menor a 0
        if (OrderExist.typePayment.count <= 0) {
            return res.status(400).send({ message: 'Debe Elegir un tipo de pago como Mínimo.' })
        } else {
            //Array de los tipos de Pago existentes en la Orden
            const payments = Order.typePayment;
            for (inven of payments) {

                if (inven._id != typePaymentExist._id) return res.send({ message: "El tipo de Pago ya fue Eliminado." });
                if (inven._id == typePaymentExist._id) continue;
            }
        }

        const deletedTypepayment = await Order.findOneAndUpdate({ _id: OrderExist._id },
            { $pull:{ 'typePayment': { 'typePayment': data.typePayment } } }, { new: true });

        //Agregando el tipo de Pago a la orden
        const payment = await detailsShoppingCart(OrderExist._id);
        return res.send({ message: 'Delte TypePayment to Order.', payment })


    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminado el tipo de Pago.' });
    }
}




//ACTUALIZAR UNA ORDEN //
exports.updateOrder = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;

        const data = {
            client: params.client,
            NIT: params.NIT,
            state: params.state,
            IVA: params.IVA,
            subTotal: params.subTotal,
            total: params.total,
        };

        //Verificación de existencia de la orden
        const orderExist = await Order.findOne({ _id: orderID });
        if (!orderExist) return res.send({ message: 'Company not found' });

        //Verificación de NIT
        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) { checkdata.NIT = 'C/F' }
        else { checkdata.NIT = params.NIT }

        //Actualización de Orden
        const OrderUpdate = await Order.findOneAndUpdate({ _id: orderID }, data, { new: true });
        if (OrderUpdate) return res.send({ message: 'Order updated', OrderUpdate });
        return res.send({ message: 'Order not updated' });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Failed to update Order' });
    }
}



//Mostar todas las ordenes de la empresa del dia
exports.getOrdersbyCompanyByDate = async (req, res) => {
    try {

        const companyID = req.user.sub;

        //Obtener la fecha actual
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

        //Busqueda de las ordenes del día y por Empresa
        const orders = await Order.find({ $and: [{ company: companyID }, { date: setDateOrder }] });
        return res.send({ orders })
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error getting la Orders.' });
    }
}




//Funcion para agregar un Producto a la orden 
exports.addProduct = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;
        const data = {
            products: params.products,
            quantity: params.quantity

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Producto//
        const productExist = await Products.findOne({ _id: params.products });
        if (!productExist) return res.status(400).send({ message: 'Product not found' });


        //Verificar que Exista la Orden //
        const OrderExist = await Order.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'Order not found' });

        //Validación que sea mayor a 0
        if (data.quantity < 0) return res.status(400).send({ message: 'The quantity product cannot be less than 0' })

        //Seteo de datos del producto
        const setProduct =
        {
            product: data.products,
            price: productExist.price,
            quantity: data.quantity,
            subTotalProduct: productExist.price * data.quantity
        }

        //Update del IVA, SubTotal, Total
        const subTotal = OrderExist.subTotal + (setProduct.price * setProduct.quantity);
        const IVA = parseFloat(setProduct.price * setProduct.quantity) * 0.12;
        const IVATotal = (OrderExist.IVA) + IVA;
        const total = (parseFloat(subTotal) + parseFloat(IVATotal));

        const newOrder = await Order.findOneAndUpdate({ _id: OrderExist._id },
            {
                $push: { products: setProduct },
                subTotal: subTotal,
                IVA: IVATotal,
                total: total
            },
            { new: true });


        //Array de los ingredientes de cada producto
        const ingredients = productExist.inventorys
        for (inven of ingredients) {
            ///Actualización de Ingredientes y Stock

            //Verificar que Exista en el Inventario //
            const inventoryExist = await Inventory.findOne({ _id: inven._id });
            if (!inventoryExist) return res.status(400).send({ message: 'Product not found in Inventory' });


            //Producto no sobrepase la existencia en el inventario
            if (inven.quantity * data.quantity > inventoryExist.stock) {
                return res.send({ message: 'There is not enough stock for this product.' });
            } else {
                //update stock de inventario//
                const resta = (inventoryExist.stock - (inven.quantity * data.quantity));
                const updateStock = await Inventory.findOneAndUpdate({ _id: inven._id }, { stock: resta }, { new: true });
            }
        }

        //Actualización de las Ventas
        const salesUpdateProduct = await Branch.findOne({ $and: [{ _id: orderExist.branch }, { 'products.product': params.products }] });
        const salesSum = salesUpdateProduct.sales + params.quantity;
        const updateSales = await Branch.findOneAndUpdate({ _id: orderExist.branch }, { sales: salesSum }, { new: true });

        //Agregando el producto a la orden
        const order = await detailsShoppingCart(OrderExist._id);
        return res.send({ message: 'Added New Product to Order.', order })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding product.' });
    }
}




//Eliminar un Producto de la Orden 
exports.deleteProduct = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;
        let data = {
            productID: params.productID,
            quantity: params.quantity
        };

        //Valida data obligatoria
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar existencia de la Orden
        const order = await Order.findOne({ _id: orderID });
        if (!order) return res.status(400).send({ message: 'Order not found.' });

        //Verificar la existencia del Producto
        const product = await Products.findOne({ _id: data.productID });
        if (!product) return res.status(400).send({ message: 'Product not found.' });



        //Verificar que exista el producto en la Orden//
        const productExistOrder = await Order.findOne({ $and: [{ _id: orderID }, { 'products.product': params.products }] });
        if (!productExistOrder) return res.status(400).send({ message: 'Product no exist in this Order' });

        //Validación que sea mayor a 0
        if (data.quantity < 0) return res.status(400).send({ message: 'The quantity product cannot be less than 0' })


        //Verificación  que la cantidad no sobre pase a la existente en la orden 
        if (data.quantity > productExistOrder.quantity) return res.send({ message: "'The product quantity cannot be greater than the one in the order.'" })


        //Update de los valores de pago
        const subTotal = order.subTotal - (productExistOrder.price * data.quantity);
        const IVA = parseFloat(productExistOrder.price * data.quantity) * 0.12;
        const IVATotal = (order.IVA) - IVA;
        const total = (parseFloat(subTotal) + parseFloat(IVATotal));
        const deleteProductOrder = await Order.findOneAndUpdate(
            { _id: orderID },
            { subTotal: subTotal, IVA: IVATotal, total: total }, { new: true }).lean();


        //Arreglo de lo que conforma el producto 
        const ingredients = productExistOrder.inventorys;

        //Actualización de Ingredientes y stock
        for (let ingre of ingredients) {

            //Verificar que Exista en el inventario //
            const inventoryExist = await Inventory.findOne({ _id: ingre._id });
            if (!inventoryExist) return res.status(400).send({ message: 'Product not found in Inventory.' });

            //update stock de empresa//
            const suma = (inventoryExist.stock + (ingre.quantity * data.quantity));
            const updateStock = await Inventory.findOneAndUpdate({ _id: inventoryExist._id }, { stock: suma }, { new: true });

        }

        //Actualización de las Ventas
        const salesUpdateProduct = await Branch.findOne({ $and: [{ _id: orderExist.branch }, { 'products.product': params.products }] });
        const salesRest = salesUpdateProduct.sales - params.quantity;
        const updateSales = await Branch.findOneAndUpdate({ _id: orderExist.branch }, { sales: salesRest }, { new: true });

        const productsOrder = order.products;
        //Eliminacion de los prodcutos de la orden
        for (let serv of productsOrder) {
            if (serv.product == data.productID) {

                //Eliminar el Producto//
                const deleteProdcutOrder = await Order.findOneAndUpdate(
                    { _id: orderID },
                    { $pull: { 'products': { 'product': data.productID } } }, { new: true }).lean();
                //Eliminar el  Producto a la Orden //
                return res.send({ message: 'Product deleted successfully ', deleteProdcutOrder });

            }
            if (serv.product != data.productID) return res.send({ message: 'Product alredy delete' })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error deleting Product.', err });
    }
}




//Función para actualizar la Entrega de la Orden  
exports.updateOrder = async (req, res) => {
    try {
        const orderID = req.params.id;
      
        //Verificar que Exista la Orden //
        const OrderExist = await OrderInventory.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'Order not found' });

        //Actualización del estado de la Orden De Inventario
        const updateState= await OrderInventory.findOneAndUpdate({ _id: orderID }, { state: "DELIVERED" }, { new: true });

        createPayment();
        
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error updating Order.' });
    }
}






//Eliminar una Orden  //
exports.deleteOrder = async (req, res) => {
    try {
        const orderID = req.params.id;


        //Verificación de existencia de la orden 
        const OrderExist = await Order.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'Order not found or already deleted.' });

        //Validación del estado de la Orden
        if (OrderExist.state == "On Going") {

            //Array de los productos de la Orden
            const productsOrdenExist = OrderExist.products;

            for (prod of productsOrdenExist) {
                //Array de los ingredientes de cada producto
                const ingredients = prod.inventorys
                for (inven of ingredients) {
                    ///Actualización de Ingredientes y Stock

                    //Verificar que Exista en el Inventario //
                    const inventoryExist = await Inventory.findOne({ _id: inven._id });
                    if (!inventoryExist) return res.status(400).send({ message: 'Product not found in Inventory' });

                    //update stock de inventario//
                    const resta = (inventoryExist.stock + (inven.quantity * data.quantity));
                    const updateStock = await Inventory.findOneAndUpdate({ _id: inven._id }, { stock: resta }, { new: true });

                }
            }
        } else {
            //Eliminación de la orden
            const orderDeleted = await Order.findOneAndDelete({ _id: orderID });
            return res.send({ message: 'Delete Order.', orderDeleted });
        }


    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting Order' });

    }
}










//Funcion para agregar una oferta a la orden 
exports.addOfert = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;
        const data = {
            oferts: params.oferts

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista la oferta//
        const ofertExist = await Ofert.findOne({ _id: params.oferts });
        if (!ofertExist) return res.status(400).send({ message: 'Ofert not found. ' });


        //Verificar que Exista EL Producto //
        const orderExist = await Order.findOne({ _id: orderID });
        if (!orderExist) return res.status(400).send({ message: 'Order not found' });

        //Seteo de datos de la oferta
        const setOfert =
        {
            product: data.products,
            discount: ofertExist.discount
        }


        //Array de las ofertas de cada orden
        const oferts = orderExist.oferts
        for (let oft of oferts) {


            const ofertExistOrder = await Order.findOne({ 'oferts.ofert': oft._id });
            if (ofertExistOrder) return res.send({ message: "Ofert already exist in product" });

            if (!ofertExistOrder) continue

        }

        if (orderExist.oferts.length == 0) {
            const quantity = (ofertExist.discount * orderExist.total) / 100;
            const totalPriceProducts = orderExist.total - quantity;
        } else {
            const ofertsDiscout = oferts.discount;
            for (let disc of ofertsDiscout) {
                const sumDiscount = 0;
                sumDiscount += disc;
            }
            const quantity = ((sumDiscount + ofertExist.discount) * orderExist.total) / 100;
            const totalPriceProducts = orderExist.total - quantity;
        }

        const newOfertProduct = await Product.findOneAndUpdate({ _id: orderExist._id },
            { $push: { oferts: setOfert }, total: totalPriceProducts },
            { new: true });

        //Agregando la oferta a la orden
        const product = await detailsShoppingCart(productExist._id);
        return res.send({ message: 'Added New ofert to Order.', product })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding Ofert.' });
    }
}




//Funcion para eliminar una oferta a la orden 
exports.deleteOfert = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;
        const data = {
            oferts: params.oferts
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista la oferta//
        const ofertExist = await Ofert.findOne({ _id: params.oferts });
        if (!ofertExist) return res.status(400).send({ message: 'Ofert not found. ' });


        //Verificar que Exista la Orden //
        const orderExist = await Order.findOne({ _id: orderID });
        if (!orderExist) return res.status(400).send({ message: 'Order not found' });

        //Seteo de datos de la oferta
        const setOfert =
        {
            product: data.products,
            discount: ofertExist.discount
        }


        //Array de las ofertas de cada orden
        const oferts = orderExist.oferts
        for (oft of oferts) {


            const ofertExistOrder = await Product.findOne({ 'oferts.ofert': oft._id });
            if (!ofertExistOrder) return res.send({ message: "Ofert already delete in product" });

            if (ofertExistOrder) continue

        }

        const ofertsDiscout = oferts.discount;
        for (let disc of ofertsDiscout) {
            const sumDiscount = 0;
            sumDiscount += disc;
        }
        const quantity = ((sumDiscount - ofertExist.discount) * orderExist.total) / 100;
        const totalPriceProducts = orderExist.total - quantity;


        const newOfertProduct = await Order.findOneAndUpdate({ _id: OrderExist._id },
            { $pull: { oferts: setOfert }, total: totalPriceProducts },
            { new: true });

        //Agregando la oferta a la orden
        const product = await detailsShoppingCart(productExist._id);
        return res.send({ message: 'Deleted  Ofert to Product.', product })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error deleted Ofert.' });
    }
}



