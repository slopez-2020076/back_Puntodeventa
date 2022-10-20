'use strict';


//Importación de los Modelos -Productos-
const Products = require('../models/product.model');

//Importación del Modelo -Orden-
const OrderInventory = require('../models/pedido.model');

const { validateData, detailsShoppingCart } = require('../utils/validate');


//Función de testeo de OrdenInventory 
exports.testOrderInventory = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}


//Función para enviar una OrdenInventory
exports.saveOrderInventory = async (req, res) => {
    try {
        
        const params = req.body;
        const dateOrder = new Date(params.entryDate);
        const dateEstimated = new Date(params.exitDate);


        const data = {
            dateOrder: params.dateOrder,
            dateEstimated: params.dateEstimated,
            state: "On Going",
            totalOrderInventory: 0,
            provider: params.provider,
            branch: params.branch,
            company: req.user.sub
        };


        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //VERIFICAR FECHAS VALIDAS//
        //fechas correctas//

        if (dateOrder > dateEstimated)
            return res.status(400).send({ message: 'Dates Order Inventory not Correct.' })

        //Verificar con Fecha Actual//

        /*PARAMETRO DE ENTRADA DATA*/
        const dateLocalOne = new Date();
        const dateLocal = (dateLocalOne).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitDate = dateLocal.split(' ');
        const splitDateOne = splitDate[0].split('/');
        if (splitDateOne[0] < 10) {
            splitDateOne[0] = '0' + splitDateOne[0];
        }
        if (splitDateOne[1] < 10) {
            splitDateOne[1] = '0' + splitDateOne[1];
        }
        const setDate = splitDateOne[2] + '-' + splitDateOne[1] + '-' + splitDateOne[0];
        const dateNow = new Date(setDate);

        if (dateOrder < dateNow || dateEstimated < dateNow)
            return res.status(400).send({ message: 'Dates OrderInventory Not Correct.' })


        
        const companyExist = await Company.findOne({_id: data.company});
        if(!companyExist) return res.send({message: "Company not found"});

        const branchExist = await Branch.findOne({_id: data.branch});
        if(!branchExist) return res.send({message: "Branch not found"});

        const providerExist = await Provider.findOne({_id: data.provider});
        if(!providerExist) return res.send({message: "Provider not found"});


        //Creación de Orden
        const addOrder = new OrderInventory(checkdata);
        await addOrder.save();

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando la La Orden.' });
    }
}




//ACTUALIZAR UNA ORDEN //
exports.updateOrder = async(req, res)=>{
    try{
        const orderID = req.params.id;
        const params = req.body;
        const dateOrder = new Date(params.entryDate);
        const dateEstimated = new Date(params.exitDate);

        const data = {
            dateOrder: params.dateOrder,
            dateEstimated: params.dateEstimated,
            state: params.state,
            provider: params.provider,
            branch: params.branch,
        };


        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);


         //VERIFICAR FECHAS VALIDAS//
        //fechas correctas//

        if (dateOrder > dateEstimated)
            return res.status(400).send({ message: 'Dates Order Inventory not Correct.' })

        //Verificar con Fecha Actual//

        /*PARAMETRO DE ENTRADA DATA*/
        const dateLocalOne = new Date();
        const dateLocal = (dateLocalOne).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitDate = dateLocal.split(' ');
        const splitDateOne = splitDate[0].split('/');
        if (splitDateOne[0] < 10) {
            splitDateOne[0] = '0' + splitDateOne[0];
        }
        if (splitDateOne[1] < 10) {
            splitDateOne[1] = '0' + splitDateOne[1];
        }
        const setDate = splitDateOne[2] + '-' + splitDateOne[1] + '-' + splitDateOne[0];
        const dateNow = new Date(setDate);

        if (dateOrder < dateNow || dateEstimated < dateNow)
            return res.status(400).send({ message: 'Dates OrderInventory Not Correct.' })



        //Verificación de existencia de la orden
        const orderInventoryExist = await Order.findOne({_id: orderID});
        if(!orderInventoryExist) return res.send({message: 'OrderInventory not found'});

        const branchExist = await Branch.findOne({_id: data.branch});
        if(!branchExist) return res.send({message: "Branch not found"});

        const providerExist = await Provider.findOne({_id: data.provider});
        if(!providerExist) return res.send({message: "Provider not found"});

        
        //Actualización de Orden
        const OrderUpdate = await OrderInventory.findOneAndUpdate({_id: orderID}, data, {new: true});
        if(OrderUpdate) return res.send({message: 'Order updated', OrderUpdate});
        return res.send({message: 'Order not updated'});

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update Order'});
    }
}




//Funcion para agregar un Producto a la orden 
exports.addProduct = async (req, res) => {
    try {
        const orderID = req.params.id;
        const params = req.body;
        const data = {
            products: params.products,
            quantity: params.quantity,
        
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Producto//
        const productExist = await Products.findOne({ _id: params.products });
        if (!productExist) return res.status(400).send({ message: 'Product not found' });


        //Verificar que Exista la Orden //
        const OrderExist = await OrderInventory.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'OrderInventory not found' });

        //Validación que sea mayor a 0
        if(data.quantity < 0) return res.status(400).send({message:'The quantity product cannot be less than 0'})

        //Seteo de datos del producto
        const setProduct =
        {
            product: data.products,
            price: productExist.price,
            quantity: data.quantity,
        }

        //Update del IVA, SubTotal, Total
        const subTotal = OrderExist.totalOrderInventory + (setProduct.price * setProduct.quantity);
        const total = (parseFloat(subTotal));

        const newOrder = await OrderInventory.findOneAndUpdate({ _id: OrderExist._id },
            {
                $push: { products: setProduct },
                totalOrderInventory: total
            },
            { new: true });


       
        //Agregando el producto a la orden
        const order = await detailsShoppingCart(OrderExist._id);
        return res.send({ message: 'Added New Product to OrderInventory.', order })

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

        //Verificar que exista el Producto//
        const productExist = await Products.findOne({ _id: params.products });
        if (!productExist) return res.status(400).send({ message: 'Product not found' });


        //Verificar que Exista la Orden //
        const OrderExist = await OrderInventory.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'OrderInventory not found' });



        //Verificar que exista el producto en la Orden//
        const productExistOrder = await OrderInventory.findOne({ $and: [{ _id: orderID }, { 'products.product': params.products }] });
        if (!productExistOrder) return res.status(400).send({ message: 'Product no exist in this Order' });

        //Validación que sea mayor a 0
        if(data.quantity < 0 ) return res.status(400).send({message:'The quantity product cannot be less than 0'})


        //Verificación  que la cantidad no sobre pase a la existente en la orden 
        if(data.quantity > productExistOrder.quantity) return res.send({message: "'The product quantity cannot be greater than the one in the order.'"})

        
        //Update de los valores de pago
        const subTotal = OrderExist.totalOrderInventory - (productExistOrder.price * data.quantity);
        const total = (parseFloat(subTotal));
        const deleteProductOrder = await OrderInventory.findOneAndUpdate(
            { _id: orderID },
            {  totalOrderInventory: total }, { new: true }).lean();


    
        const productsOrder = OrderExist.products;
        //Eliminacion de los prodcutos de la orden
        for (let serv of productsOrder) {
            if (serv.product == data.productID) {

                //Eliminar el Producto//
                const deleteProdcutOrder = await OrderInventory.findOneAndUpdate(
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



//Función para actualizar stock y estado, media vez se haya entregado 
exports.UpdateDelivery = async (req, res) => {
    try {
        const orderID = req.params.id;
      
        //Verificar que Exista la Orden //
        const OrderExist = await OrderInventory.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'Order not found' });


        //Array de los productos de la orden 
        const ingredients = OrderExist.products
        for (inven of ingredients) {
            ///Actualización de Ingredientes y Stock

            //Verificar que Exista en el Inventario //
            const inventoryExist = await Inventory.findOne({ _id: inven._id });
            if (!inventoryExist) return res.status(400).send({ message: 'Product not found in Inventory' });

            //Validación que sea mayor a 0
            if(inven.quantity < 0){
                return res.status(400).send({message:'The quantity product cannot be less than 0'})

            } else {
                //update stock de inventario//
                const suma = (inventoryExist.stock +  inven.quantity);
                const updateStock = await Inventory.findOneAndUpdate({ _id: inven._id }, { stock: suma }, { new: true });
            }
        }

        //Actualización del estado de la Orden De Inventario
        const updateState= await OrderInventory.findOneAndUpdate({ _id: orderID }, { state: "DELIVERED" }, { new: true });

        

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error updating product.' });
    }
}









//Eliminar una Orden  //
exports.deleteOrder = async (req, res) => {
    try {
        const orderID = req.params.id;


        //Verificación de existencia de la orden 
        const OrderExist = await OrderInventory.findOne({ _id: orderID });
        if (!OrderExist) return res.status(400).send({ message: 'Order not found or already deleted.' });

        //Validación del estado de la Orden
        if (OrderExist.state == "DELIVERED") {
            return res.send({message: "Order could not be deleted as it has already been delivered "})
        }else{
            //Eliminación de la orden
            const orderDeleted = await OrderInventory.findOneAndDelete({ _id: orderID });
            return res.send({ message: 'Delete Order.', orderDeleted });
        }
        
        
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting Order' });

    }
}

