'use strict';


//Importación de los Modelos -Inventario-
const Inventory = require('../models/inventory.model');

//Importación del Modelo -Sucursales-
const Branch = require('../models/branch.model');
const Category = require('../models/categoryProduct.model');
const Ofert = require('../models/ofert.model');
const Company = require('../models/company.model');
const Product = require('../models/product.model');

const { validateData, checkUpdated } = require('../utils/validate');


//Función de testeo de Product 
exports.testProduct = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}


//Función para crear un producto
exports.saveProduct = async (req, res) => {
    try {
        const company = req.user.sub;
        const params = req.body;

        const data = {
            name: params.name,
            description: params.description,
            sales: 0,
            typeProduct: params.typeProduct,
            presentation: params.presentation,
            codeBar: params.codeBar,
            category: params.category,
            branch: params.branch,
            TotalPrice: params.TotalPrice,
            company: company,
        };

        const branchExist = await Branch.findOne({ _id: data.branch });
        if (!branchExist) return res.send({ message: "Branch not found" });

        //-Verificar que Exista la Categoria.//
        const categoryExist = await Category.findOne({ _id: params.category });
        if (!categoryExist) return res.send({ message: 'Category not found.' });

        const productExist = await Product.findOne({ $and: [{ name: params.name }, { category: categoryExist._id }] });
        if (productExist) return res.send({ message: 'Product is already added in the category.' });

        const codeBarsExist = await Product.findOne({ $and: [{ codeBar: data.codeBar }, { branch: data.branch }] });
        if (codeBarsExist) return res.send({ message: "CodeBar alredy exist." });


        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //Validación que sea mayor a 0
        if (data.TotalPrice <= 0) return res.status(400).send({ message: 'The quantity totel cannot be less than 0' });

        //Creación de Orden
        const addProduct = new Product(data);
        await addProduct.save();
        return res.send({message: 'Product saved:' , addProduct  });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando el Producto.' });
    }
}





//ACTUALIZAR || Editar Producto//
exports.updateProduct = async (req, res) => {
    try {

        //-Capturar el ID del Producto a Actualizar.//
        const productId = req.params.id;
        const params = req.body;

        //Data Necesaria para la Actualización.//
        const check = await checkUpdated(params);
        if (check === false) return res.status(400).send({ message: 'Data not recived' });


        const msg = validateData(params);
        if (msg) return res.status(400).send(msg);

        //- Verificar que Exista el Producto.//
        const productExist = await Product.findOne({ _id: productId });
        if (!productExist) return res.send({ message: 'Product not found.' });


        if(productExist.codeBar == params.codeBar){

            if(params.category != undefined || params.category != null){
                //Verificar que si cambia la Categoria Exista.//
                const categoryExist = await Category.findOne({ _id: params.category });
                if (!categoryExist) return res.send({ message: 'Category not found.' });
            }

            if(params.branch != undefined || params.branch != null){
                //Verificar que si cambia la Categoria Exista.//
                const branchExist = await Branch.findOne({ _id: params.branch });
                if (!branchExist) return res.send({ message: 'Branch not found.' });
            }

            if(params.name != undefined || params.name != null){
                 //- Verificar que no se duplique con otro Producto.//
                const notDuplicate = await Product.findOne({ $and: [{ name: params.name }, { category: productExist.category }] });
                if (notDuplicate ) return res.send({ message: 'El producto ya existe en esa categoría.' });
            }

            //Validación que sea mayor a 0
            //Validación que sea mayor a 0
            if(params.TotalPrice != undefined || params.TotalPrice != null){
                if (params.TotalPrice <= 0) return res.status(400).send({ message: 'The quantity totel cannot be less than 0' });   
                for (let element of productExist.oferts) {
                    const deleteElementProduct = await Product.findOneAndUpdate(
                        { _id: productExist._id },
                        { $pull: { 'oferts': { 'ofert': element.ofert } } }, { new: true }).lean();
                }
            }

            if(params.sales != undefined || params.sales != null){
                if (params.sales < 0) return res.status(400).send({ message: 'The quantity sales cannot be less than 0' })
            }

            //- Actualizar el Producto.//
            const productUpdated = await Product.findOneAndUpdate(
                { _id: productId }, params, { new: true }).populate('category').lean();
                return res.send({ message: 'Product Updated.', productUpdated });

        }

        if(productExist.codeBar != params.codeBar){

            //Verificar la existencia del codigo de barras//
            const codeBarsExist = await Product.findOne({ $and: [{ codeBar: params.codeBar }, { branch: productExist.branch }] });
            if (codeBarsExist) return res.send({ message: "CodeBar alredy exist in the branch." });

            if(!codeBarsExist){

                if(params.category != undefined || params.category != null){
                    //Verificar que si cambia la Categoria Exista.//
                    const categoryExist = await Category.findOne({ _id: params.category });
                    if (!categoryExist) return res.send({ message: 'Category not found.' });
                }
    
                if(params.branch != undefined || params.branch != null){
                    //Verificar que si cambia la Categoria Exista.//
                    const branchExist = await Branch.findOne({ _id: params.branch });
                    if (!branchExist) return res.send({ message: 'Branch not found.' });
                }
    
                if(params.name != undefined || params.name != null){
                     //- Verificar que no se duplique con otro Producto.//
                    const notDuplicate = await Product.findOne({ $and: [{ name: params.name }, { category: productExist.category }] });
                    if (notDuplicate ) return res.send({ message: 'El producto ya existe en esa categoría.' });
                }
    
                
                //Validación que sea mayor a 0
                if(params.TotalPrice != undefined || params.TotalPrice != null){
                    if (params.TotalPrice <= 0) return res.status(400).send({ message: 'The quantity totel cannot be less than 0' });   
                    for (let element of productExist.oferts) {
                        const deleteElementProduct = await Product.findOneAndUpdate(
                            { _id: productExist._id },
                            { $pull: { 'oferts': { 'ofert': element.ofert } } }, { new: true }).lean();
                    }
                }
    
                if(params.sales != undefined || params.sales != null){
                    if (params.sales < 0) return res.status(400).send({ message: 'The quantity sales cannot be less than 0' })
                }

                //- Actualizar el Producto.//
                const productUpdated = await Product.findOneAndUpdate(
                { _id: productId }, params, { new: true }).populate('category').lean();
                return res.send({ message: 'Product Updated.', productUpdated });
            }
        }


    } catch (err) {
        console.log(err);
        return err;
    }
}





//DELETE || Eliminar Producto
exports.deleteProduct = async (req, res) => {
    try {

        //Capturar el ID del Producto.//
        const productId = req.params.id;
        const productDeleted = await Product.findOneAndDelete({ _id: productId }).populate('category').lean();

        if (!productDeleted) return res.status(500).send({ message: 'Product not found or already delete.' });

        return res.send({ message: 'Product Deleted.', productDeleted });
    } catch (err) {
        console.log(err);
        return err;
    }
}






exports.addOProdcutCorre = async (req, res) => {
    try {
        const productID = req.params.id;
        const params = req.body;
        const data = {
            product: params.product,
            quantity: params.quantity

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Producto //
        const ofertExist = await Inventory.findOne({ _id: params.product });
        if (!ofertExist) return res.status(400).send({ message: 'Product Inventory not found. ' });


        //Verificar que Exista EL Producto //
        const productExist = await Product.findOne({ _id: productID });
        if (!productExist) return res.status(400).send({ message: 'Product not found' });

        const inventories = productExist.inventorys;
        //Seteo de datos del Producto
        const setProduct ={
            inventory: data.product,
            quantity: data.quantity,
            price: ofertExist.price,
            totalPriceProducts: ofertExist.price * data.quantity
        }

        

        //Array de los productos que existen 
        
        for (let oft of inventories) {

            //const setDataProduct = {
            //    quantity: oft.quantity + data.quantity,
            //    totalPriceProducts: ofertExist.price * (data.quantity + oft.quantity)
            //}

            
            //const ofertExistOrder = await Product.findOne({ 'inventorys.inventory':  });
            if(oft.inventory == data.product)return res.send({ message: "Product already exist in product" });
            
            //if (ofertExistOrder) return res.send({ message: "Product already exist in product" });

            if (oft.inventory != data.product) continue

        }

    
        const newProductInProduct = await Product.findOneAndUpdate({ _id: productExist._id },
            { $push: { inventorys: setProduct } },
            { new: true });

        //Agregando la Producto de Inventario al Producto 
        return res.send({ message: 'Added New product to Product.', newProductInProduct })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding Ofert.' });
    }
}




//Funcion para Eliminar un Producto de Inventario del Producto 
exports.DeleteProductInventory = async (req, res) => {
    try {
        const productID = req.params.id;
        const params = req.body;
        const data = {
            product: params.product
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Producto en el Inventario//
        const productExistInventory = await Inventory.findOne({ _id: params.product });
        if (!productExistInventory) return res.status(400).send({ message: 'Product not found this Inventory' });


        //Verificar que Exista EL Producto //
        const productExist = await Product.findOne({ _id: productID });
        if (!productExist) return res.status(400).send({ message: 'Product not found' });


        //Array de los ingredientes de cada producto
        const ingredients = productExist.inventorys;
        if(ingredients.length == 0) return res.send({message: "No hay Agregados elementos en el producto."})
        for (let inven of ingredients) {

            if(inven.inventory != data.product ){
                return res.send({message: "Product not found or alredy deleted"});
            }
        
            if (inven.inventory == data.product) continue

        }
        
        const deleteProductInventory = await Product.findOneAndUpdate(
            { _id: productID },
            { $pull: { 'inventorys': { 'inventory': data.product } } }, { new: true }).lean();

        //Eliminando el productoInventory al Producto
        return res.send({ message: 'Delete  ProductInventory to Product.', deleteProductInventory });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding product.' });
    }
}



//Visualizar todos los Productos//
exports.getProducts = async (req, res) => {
    try {

        const products = await Product.find().populate('category').lean();
        if (products.length === 0) return res.send({ message: 'Products not exist.' })

        return res.send({ message: 'Products Found', products });

    } catch (err) {
        console.log(err);
        return err;
    }
}


//Visualizar un Producto//
exports.getProduct = async (req, res) => {
    try {

        //ID de la Categoría//
        const product = req.params.id;

        //Buscar la Categoría Ingresada/./
        const searchProduct = await Product.findOne({ _id: product }).populate('category').lean();;

        //- Verificar que Exista el Producto.//
        if (!searchProduct) return res.status(500).send({ message: 'Product not found.' });

        return res.send({ message: 'Product Found:', searchProduct });

    } catch (err) {
        console.log(err);
        return err;
    }
}




//Visualizar los Productos más vendidos//
exports.exhaustedProducts = async (req, res) => {
    try {

        const products = await Product.find({ sales: 0 });
        if (products.length === 0) return res.send({ message: 'There are not exhausted products.' });

        return res.send({ message: 'Products Exhausted', products });

    } catch (err) {
        console.log(err);
        return err;
    }
}



//Visualizar Productos Populares//
exports.popularProducts = async (req, res) => {
    try {

        const products = await Product.find({ sales: { $gt: 5 } }).sort({ sales: -1 });
        if (!products) { }
        return res.status(500).send({ message: 'Popular Products', products });

    } catch (err) {
        console.log(err);
        return err;
    }
}





//Ver Productos por Categoría ID//
exports.productsForCategoryID = async (req, res) => {
    try {
        //ID de la Categoría//
        const category = req.params.id;

        //Buscar la Categoría Ingresada.//
        const searchCategory = await Category.findOne({ _id: category });
        if (!searchCategory) return res.status(500).send({ message: 'Category not found.' });

        //Buscar los Productos por Categoría.//
        const searchProducts = await Product.find({ category: category }).populate('category').lean();;

        //Verificar que existan Productos con dicha Categoría.//
        if (searchProducts.length === 0) return res.status(500).send({ message: 'Products not found for this Category.' })

        return res.send({ category: searchCategory.name, message: 'Found Products:', searchProducts });

    } catch (err) {
        console.log(err);
        return err;
    }
}




//Ver Productos por Categoría NAME//
exports.productsForCategoryName = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name
        };

        //Validar que llegue el Nombre del Producto//
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //- Verificar que Exista la Categoría.//
        const category = await Category.findOne({ name: { $regex: params.name, $options: 'i' } }).lean();
        if (!category) return res.status(500).send({ message: 'Category not found.' })


        const searchProducts = await Product.find({ category: category._id });
        if (searchProducts.length === 0) return res.status(500).send({ message: 'Products not found for this Category.' })
        return res.send({ category: category.name, message: 'Found Products:', searchProducts });


    } catch (err) {
        console.log(err);
        return err;
    }
}





//Buscar los Productos por su nombre//
exports.searchProductByName = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name
        };

        //Validar que llegue el Nombre del Producto//
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const product = await Product.find({ name: { $regex: params.name, $options: 'i' } });
        return res.send({ product });

    } catch (err) {
        console.log(err);
        return err;
    }
}






//Funcion para agregar una oferta al producto// 
exports.addOfert = async (req, res) => {
    try {
        const productID = req.params.id;
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
        const productExist = await Product.findOne({ _id: productID });
        if (!productExist) return res.status(400).send({ message: 'Product not found' });

        
        //Array de las ofertas de cada producto
        const oferts = productExist.oferts;
        for (let oft of oferts) {

            if (oft.ofert == data.oferts) return res.send({ message: "Ofert already exist in product" });
            if (oft.ofert != data.oferts) continue

        }

        const quantity = (ofertExist.discount * productExist.TotalPrice) / 100;
        const totalPriceProductsNull = productExist.TotalPrice - quantity;

        //Seteo de datos de la oferta
        const setOfert =
        {
            ofert: ofertExist._id,
            discount: ofertExist.discount,
            quantityRested: quantity.toFixed(2)
        }

        const newOfertProduct = await Product.findOneAndUpdate({ _id: productExist._id },
            { $push: { oferts: setOfert }, TotalPrice: totalPriceProductsNull.toFixed(2) },
            { new: true });

        return res.send({ message: 'Added New Ofert to Product.', newOfertProduct });


    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding Ofert.' });
    }
}




//Funcion para eliminar una oferta al producto//
exports.deleteOfert = async (req, res) => {
    try {
        const productID = req.params.id;
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
        const productExist = await Product.findOne({ _id: productID });
        if (!productExist) return res.status(400).send({ message: 'Product not found' });


        //Array de las ofertas de cada producto
        const oferts = productExist.oferts;
        if(oferts.length == 0) return res.send({message: "No se han agregado ofertas al Producto."})
        for (let oft of oferts) {
            
            if (oft.ofert == data.oferts) {

                const quantity = productExist.TotalPrice + oft.quantityRested; 
                const updateDiscount = await Product.findOneAndUpdate({_id: productID}, {TotalPrice: quantity}, {new: true});
                //Eliminar la Oferta//
                const deleteOfert = await Product.findOneAndUpdate(
                    { _id: productID },
                    { $pull: { 'oferts': { 'ofert': data.oferts } } }, { new: true }).lean();
                //Eliminar el  Servicio a la Reservación //
                return res.send({ message: 'Ofert deleted successfully ', deleteOfert });

            }
            if (oft.ofert != data.oferts) return res.send({ message: 'Ofert not exist in the product alredy delete.' })

        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error deleted Ofert.' });
    }
}

