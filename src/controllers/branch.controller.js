'use strict'

const Branch = require('../models/branch.model');
const Township = require('../models/township.model');
const Inventory = require('../models/inventory.model');
const Company = require ('../models/company.model');
const Order = require('../models/order.model');
const Cierre = require('../models/cierre.model');
const Turn = require('../models/turn.model');
const Products = require('../models/product.model');

const {validateData, checkUpdate} = require('../utils/validate');

//FUNCIONES PÚBLICAS
//Función de Testeo//
exports.branchTest = async (req, res)=>{
    await res.send({message: 'Branch Test is running.'})
}



//Agregar una sucursal//
exports.saveBranch = async(req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name,
            phone: params.phone,
            address: params.address,
            company: req.user.sub,
            township: params.township,
            
        };
        
        //Validar data obligatoria
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        //Verificar que si la sucursa ya ha sido creada
        const companyExist = await Branch.findOne({$and: [{name: data.name},{ company: data.company}]});
        if(companyExist) return res.status(400).send({message: 'Branch already created'});
  

        //Verificar que exista el municipio
        const townshipExist = await Township.findOne({_id: params.township});
        if(!townshipExist) return res.status(400).send({message: 'Township not found'});

        //Agregar una nueva sucursal
        const branch = new Branch(data);
        await branch.save();
        return res.send({message: 'Branch created successfully', branch});

    }catch(err){
        console.log(err);
        return err;
    }
}




//ACTUALIZAR UNA SUCURSAL//
exports.updateBranch = async (req, res) =>{
    try{
        const branchID = req.params.id;
        const params = req.body; 
        const  data = {
            name: params.name,
            phone: params.phone, 
            address: params.address,
            township: params.township,

        }
        
        //Validar la existencia de la sucursal 
        const branchExist = await Branch.findOne({_id: branchID});
        if(!branchExist) return res.send({message: 'Branch not found'});


        //Validar que solo pueda actulizar 
        const validateUpdate = await checkUpdate(params);
            if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        
        if(branchExist.name == params.name){
            if(params.township != undefined || params.township != null){
                //Verificación de la existencia del Municipio 
                const townshipExist = await Township.findOne({ _id: params.township });
                if (!townshipExist) return res.send({ message: 'Township not found' });
            }
            
            //Actualización de Sucursal
            const branchUpdate = await Branch.findOneAndUpdate({ _id: branchID }, params, { new: true }).lean();
            if (!branchUpdate) return res.send({ message: 'Branch not updated' });
            return res.send({ message: 'Branch updated', branchUpdate });
        }

        if(branchExist.name != params.name){
            //Verificación de la existencia de nombre de la sucursal
            const nameBranch = await Branch.findOne({ $and: [{ name: params.name }, { company: branchExist.company }] });
            if (nameBranch) return res.send({ message: "Name branch alredy in use" });

            if(params.township != undefined || params.township != null){
                //Verificación de la existencia del Municipio 
                const townshipExist = await Township.findOne({ _id: params.township });
                if (!townshipExist) return res.send({ message: 'Township not found' });
            }
            
            //Actualización de Sucursal
            const branchUpdate = await Branch.findOneAndUpdate({ _id: branchID }, params, { new: true }).lean();
            if (!branchUpdate) return res.send({ message: 'Branch not updated' });
            return res.send({ message: 'Branch updated', branchUpdate });
        }

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update company'});
    }
}



//ELIMAR UNA SUCURSAL//
exports.deleteBranch = async(req, res)=>{
    try{
        const branchID = req.params.id;

        //Eliminación de Cierres
        const closingExist = await Cierre.find({branch: branchID});
        for(let closingDeleted of closingExist)
        { const closingDeleted = await Cierre.findOneAndDelete({ branch: branchID}); }


        //Eliminación de Turnos
        const turnExisted = await Branch.find({branch: branchID});
        for(let turnDeleted of turnExisted)
        { const turnDeleted = await Turn.findOneAndDelete({ branch: branchID}); }

        //Eliminación de Sucursal
        const branchDeleted = await Branch.findOneAndDelete({_id: branchID});
        if(!branchDeleted) return res.send({message: 'Branch not found or already deleted'});
        return res.send({message: 'Branch deleted', branchDeleted});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting branch'});
    }
}




//Agregar Productos//
exports.addProductBranch = async (req, res) => {
    try {
        const params = req.body;
        const companyID = req.user.sub;
        const branchID = req.params.id;
        const productID = params.product;
        const cantidad = params.cantidad;
        const paramsObligatory =
        {
            branch: branchID, 
            products: productID
        }

        //Validación de Data
        const msg = validateData(paramsObligatory);
        if(msg) return res.status(400).send(msg);


        //Verificar que Exista la sucursal//
        const branchtExist = await Branch.findOne({ $and: [{ _id: branchID }, { company: companyID }] });
        if (!branchtExist) return res.status(400).send({ message: 'Branch not Found.' })


        //Busca el producto por ID y empresa//
        const productExist = await Products.findOne({ $and: [{ _id: productID }, { company: companyID }] });
        if (!productExist) return res.status(400).send({ message: 'Product not Found.' });

        
        //Seteo de data//
        const data = {
            name: productExist.name,
            price: productExist.price,
            product: productExist._id,
            sales: 0
        }


        const products = await branchtExist.products

        //Agregar primer Producto a la Sucursal//
        if (products.length == 0) {
            const newProductOne = await Branch.findOneAndUpdate({ _id: branchID }, { $push: { products: data } }, { new: true }).populate('products');
            return res.send({ message: 'Added New product to Branch', newProductOne });
        }

        //Verificar que no se repitan los productos//
        const productExistBranch = await Branch.findOne({ $and: [{ _id: branchID }, { 'products.product': productID }] });
        if (productExistBranch) return res.status(400).send({ message: 'Product is already in this Branch' });

        //Agregando un producto a la sucursal
        const newProduct = await Branch.findOneAndUpdate({ _id: branchID }, { $push: { products: data } }, { new: true }).populate('products');
        return res.send({ message: 'Added New product to Branch', newProduct });

    } catch (err) {
        console.log(err);
        return err;
    }
}




//Eliminar Producto de la Sucursal//
exports.deleteProductBranch = async (req, res) => {
    try{
        const params = req.body;
        const branchID = req.params.id;
        const productID = params.product;

        //Verificación de Existencia de sucursal
        const branchExist= await Branch.findOne({_id: branchID })
            if(!branchExist) return res.send({message: 'Branch not found'});

        //Verificación de Existencia de Producto
        const product = await Products.findOne({_id:productID});
        if (!product) return res.send({message: "Product not Exist"});

        //Verificación de Existencia de Producto en la Sucursal
        const productExistBranch = await Branch.findOne({ $and: [{ _id: branchID }, { 'products.product': productID }] });
        if (!productExistBranch) return res.status(400).send({ message: 'Product is not found in the Branch' });
       
        //Eliminando de Producto de una Branch//
        const deleteProduct = await Branch.findOneAndUpdate({_id: branchID}, {$pull: { 'products': {'product': productID}}}, {new: true});
        return res.send({ message: 'Deleted Product Successfully ', deleteProduct });

    }catch(err){
        console.log(err);
        return err; 
    }
}


//Mostrar todos los productos de la Sucursal
exports.getProductsBranch = async(req,res)=>{
    try{
        const branchID = req.params.id
        const companyID = req.user.sub

        const branch = await Branch.findOne({ $and: [{ _id: branchID }, { company: companyID }]}).populate('products.product').lean();
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});

        const productsBranch = await branch.products
        return res.send({productsBranch});
    }catch (err){
        console.log(err);
        return err;
    }
}




//Mostrar un solo producto de la Sucursal
exports.getProductBranch = async(req,res)=>{
    try{
        const params = req.body;
        const branchID = req.params.id;
        const product = params.product;

        const branch = await Branch.findOne({_id: branchID});
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});

        const productBranch = branch.products;
        for(let arreglo of productBranch){
            
            if(arreglo.name == product){
                return res.send({message: " Product:" ,arreglo});
            }else return res.send({message: " Product not found"});
        }
    }catch (err){
        console.log(err);
        return err;
    }
}





//Mostrar todas las sucursales de la empresa
exports.getBranches = async(req,res)=>{
    try{
        const companyID = req.user.sub

        const branch = await Branch.find( { company: companyID });
        if(!branch) return res.status(400).send({message: 'Branches Not Found'});

        return res.send({branch});
    }catch (err){
        console.log(err);
        return err;
    }
}




//Mostrar una sucursal 
exports.getBranch = async(req,res)=>{
    try{
        const branchID = req.params.id;

        const branch = await Branch.findOne( { _id: branchID });
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});

        return res.send({branch});
    }catch (err){
        console.log(err);
        return err;
    }
}

