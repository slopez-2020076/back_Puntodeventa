'use strict';

//Importación del Modelo -Producto-
const Inventory = require('../models/inventory.model');
const Company = require('../models/company.model');
const Product = require('../models/product.model');
const Provider = require('../models/provider.model');
const Warehouse = require('../models/warehouse.model');
const { validateData, checkUpdated } = require('../utils/validate');


//Funciones Publicas//

/*Función de Testeo*/
exports.testInventory = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}


//Funciones Privadas//
//Registrar || Agregar Productos//
exports.addProductInventory = async (req, res) => {
    try {
        const params = req.body;
        const company = req.user.sub;
        
        const data = {
            name: params.name,
            description: params.description,
            price: params.price,
            stock: params.stock,
            typeProduct: params.typeProduct,
            codeBar: params.codeBar,
            provider: params.provider,
            warehouse: params.warehouse,
        };

        const msg = validateData(data);
        if (!msg) {

            //- Verificar que Exista el Proveedor.//
            const providerExist = await Provider.findOne({ _id: data.provider });
            if (!providerExist) return res.status(400).send({ message: 'Provider not found.' });


            //- Verificar que Exista la Bodega.//
            const warehouseExist = await Warehouse.findOne({ _id: data.warehouse });
            if (!warehouseExist) return res.status(400).send({ message: 'Warehouse not found.' });


            //Verificar la existencia del codigo de barras//
            const codeBarsExist = await Inventory.findOne({ $and: [{ codeBar: data.codeBar }, { branch: data.branch }] });
            if (codeBarsExist) return res.send({ message: "CodeBar alredy exist." });


            //- Verficar que no exista el prodcuto.//
            const  productExist = await Inventory.findOne({ $and: [{ name: params.name }, { warehouse: data.warehouse }, {branch: data.branch}] });
            if (!productExist) {
                if (data.price <= 0)
                    return res.status(400).send({ message: 'The price cannot be less than 0' })

                if (data.stock <= 0)
                    return res.status(400).send({ message: 'The stock cannot be less than 0' })

                let saveProduct = new Inventory(data);
                await saveProduct.save();
                return res.send({ saveProduct, message: 'Product saved' });
            } else return res.status(400).send({ message: 'The product you entered already exists.' });
        } else return res.status(400).send(msg);
    }
    catch (err) {
        console.log(err);
        return err;
    }
}



//ACTUALIZAR || Editar Producto//
exports.updateProductInventory = async (req, res) => {
    try {
        const params = req.body;
        
        //-Capturar el ID del Producto a Actualizar.//
        const productId = req.params.id;

        //Data Necesaria para la Actualización.//
        const check = await checkUpdated(params);
        if (check === false) return res.status(400).send({ message: 'Data not recived' });


        const msg = validateData(params);
        if (msg) return res.status(400).send(msg);

        //- Verificar que Exista el Producto.//
        const productExist = await Inventory.findOne({ _id: productId });
        if (!productExist) return res.status(400).send({ message: 'Product not found.' });

        if(productExist.name == params.name){

        
            //- Verificar que Exista la bodega.//
            if(params.warehouse != undefined || params.warehouse != null){
                const warehouseExist = await Warehouse.findOne({ _id: params.warehouse });
                if (!warehouseExist) return res.status(400).send({ message: 'Warehouse not found.' });
            }

            //- Verificar que Exista el Proveedor.//
            if(params.provider != undefined || params.provider != null){
                const providerExist = await Provider.findOne({ _id: params.provider });
                if (!providerExist) return res.status(400).send({ message: 'Provider not found.' });
            }

            //Verificar la existencia del codigo de barras//
            if(params.codeBar != undefined || params.codeBar != null){
                const codeBarsExist = await Branch.findOne({ $and: [{ codeBar: params.codeBar }, { branch: productExist.branch }] });
                if (codeBarsExist) return res.send({ message: "CodeBar alredy exist." });
            }

            if(params.stock != undefined || params.stock != null ){
                if (params.stock <= 0) return res.status(400).send({ message: 'The stock cannot be less than 0' });
            }

            if(params.price != undefined || params.price != null){
                if (params.price <= 0) return res.status(400).send({ message: 'The price cannot be less than 0' });
            }

            const productUpdated = await Inventory.findOneAndUpdate({ _id: productId }, params, { new: true });
            if (!productUpdated) return res.status(400).send({ message: 'Product not found' });
            return res.send({ message: 'Product update', productUpdated });

        }

       
        if(params.name != productExist.name){
            //- Verificar que no se duplique con otro Producto.//
            const productDuplicate = await Inventory.findOne({ $and: [{ name: params.name }, { warehouse: productExist.warehouse }] });
            if (productDuplicate) return res.status(400).send({ message: 'Name already in use' });

            //- Verificar que Exista la bodega.//
            if(params.warehouse != undefined || params.warehouse != null){
                const warehouseExist = await Warehouse.findOne({ _id: params.warehouse });
                if (!warehouseExist) return res.status(400).send({ message: 'Warehouse not found.' });
            }

            //- Verificar que Exista el Proveedor.//
            if(params.provider != undefined || params.provider != null){
                const providerExist = await Provider.findOne({ _id: params.provider });
                if (!providerExist) return res.status(400).send({ message: 'Provider not found.' });
            }

            //Verificar la existencia del codigo de barras//
            if(params.codeBar != undefined || params.codeBar != null){
                const codeBarsExist = await Branch.findOne({ $and: [{ codeBar: params.codeBar }, { branch: productExist.branch }] });
                if (codeBarsExist) return res.send({ message: "CodeBar alredy exist." });
            }

            if(params.stock != undefined || params.stock != null ){
                if (params.stock <= 0) return res.status(400).send({ message: 'The stock cannot be less than 0' });
            }

            if(params.price != undefined || params.price != null){
                if (params.price <= 0) return res.status(400).send({ message: 'The price cannot be less than 0' });
            }

            const productUpdated = await Inventory.findOneAndUpdate({ _id: productId }, params, { new: true });
            if (!productUpdated) return res.status(400).send({ message: 'Product not found' });
            return res.send({ message: 'Product update', productUpdated });
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}





//DELETE || Eliminar Producto
exports.deleteProductInventory = async (req, res) => {
    try {
        //Capturar el ID del Producto.//
        const elementID = req.params.id;

        const user = req.user.sub;
        const company = await Company.findOne({ _id: user.company });


        //Vefiricar que si el elemento es parte de un prodcuto eliminarlo de ahí también 
        const productsCompany = await Product.find({ company: user });
        for (let prod of productsCompany) {

            const elementExistProduct = prod.inventorys;
            console.log(elementExistProduct)
            for (let element of elementExistProduct) {
                const deleteElementProduct = await Product.findOneAndUpdate(
                    { _id: prod._id },
                    { $pull: { 'inventorys': { 'inventory': element.inventory } } }, { new: true }).lean();
            }

        }

        //Eliminación del producto en el inventario
        const productDeleted = await Inventory.findOneAndDelete({ _id: elementID });
        if (!productDeleted) {
            return res.status(500).send({ message: 'Product not found or already delete.' });

        } else return res.send({ message: 'Product Deleted.', productDeleted });
    } catch (err) {
        console.log(err);
        return err;
    }
}





//Buscar Productos por nombre//
exports.searchProductNameInventory = async (req, res) => {
    try {
        const params = req.body;
        const data = { name: params.name };

        const msg = validateData(data);
        if (!msg) {
            const product = await Inventory.find({ name: { $regex: params.name, $options: 'i' } });
            
            return res.send({ product });
        } else return res.status(400).send(msg);
    } catch (err) {
        console.log(err);
        return err;
    }
}




//Buscar Productos por proveedor//
exports.searchProductProvider = async (req, res) => {
    try {
        const providerID =  req.params.id;

        const product = await Inventory.find({ provider: providerID});
        if(!product) return res.send({message: "Products not found."});
        return res.send({ product });
    } catch (err) {
        console.log(err);
        return err;
    }
}




//Buscar Productos por Bodega//
exports.searchProductWarehouse = async (req, res) => {
    try {
        const warehouseID =  req.params.id;

        const product = await Inventory.find({ warehouse: warehouseID});
        if(!product) return res.send({message: "Products not found."});
        return res.send({ product });

    } catch (err) {
        console.log(err);
        return err;
    }
}



//Buscar Productos de Inventario po ID//
exports.getInventory = async (req, res) => {
    try {
        const productID =  req.params.id;

        const product = await Inventory.findOne({ _id: productID});
        if(!product) return res.send({message: "Product not found."});
        return res.send({ product });

    } catch (err) {
        console.log(err);
        return err;
    }
}

//Buscar Productos de Inventario po ID//
exports.getInventories = async (req, res) => {
    try {
    
        const product = await Inventory.find();
        if(!product) return res.send({message: "Products not found."});
        return res.send({ product });

    } catch (err) {
        console.log(err);
        return err;
    }
}



