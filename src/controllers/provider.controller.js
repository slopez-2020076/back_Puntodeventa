'use strict'

const Provider = require('../models/provider.model');
const Inventory = require('../models/inventory.model');
const { validateData, checkUpdated} = require('../utils/validate');


//Función de Testeo//
exports.testProvider = (req, res)=>{
    return res.send({message: 'Function testProvider is running'}); 
}




//Agregar Proveedor//
exports.saveProvider = async (req, res)=>{
    try{
        const params = req.body; 
        const data = {
            name: params.name,
            address: params.address,
            NIT: params.NIT,
            contact: params.contact,
            email: params.email,
            company: req.user.sub

        };

        //Validación de Data
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        
        //Verificación de existencia de Proveedor
        const providerExist = await Provider.findOne({$and: [ {NIT: params.NIT}, {company: data.company}]});
        if(!providerExist){
            const provider = new Provider(data);
            await provider.save();
            return res.send({message: 'Provider saved', provider});
        }else return res.status(400).send({message: 'Proveedor ya existe con ese NIT.'});
    
    }catch(err){
        console.log(err); 
        return err; 
    }
}



//Mostrar todos los Proveedores//
exports.getProviders = async (req, res)=>{
    try{
        const providers = await Provider.find();
        return res.send({message: 'Providers:', providers})
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Mostrar un  Proveedor//
exports.getProvider = async (req, res)=>{
    try
    {
        const providerID = req.params.id
        const provider = await Provider.findOne({_id: providerID});
        return res.send({message: 'Provider:', provider})
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Buscar Proveedor por NOMBRE//
exports.getProviderByName = async (req, res)=>{
    try
    {
        const params =  req.body;
        const data = { name: params.name };

        const msg = validateData(data);
        if (!msg) {
            const provider = await Provider.find({ name: { $regex: params.name, $options: 'i' } }).populate('company');
            if(!provider ) return res.send({message: " Provider not found"})
            return res.send({ provider });
        } else return res.status(400).send(msg);
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Buscar Proveedor por NIT//
exports.getProviderByNIT = async (req, res)=>{
    try
    {
        const params =  req.body;
        const data = { NIT: params.NIT };

        const msg = validateData(data);
        if (!msg) {
            const provider = await Provider.findOne({ NIT: data.NIT }).populate('company');
            if(!provider) return res.send({message: "Provider not found"});
            return res.send({ provider });
        } else return res.status(400).send(msg);
    }catch(err){
        console.log(err); 
        return err; 
    }
}



//Buscar Proveedor por Company//
exports.getProvidersByCopmany = async (req, res)=>{
    try
    {
        const companyID = req.params.id;
        const provider = await Provider.find({ company: companyID }).populate('company');
        if(!provider) return res.send({message: "Providers not Found"})
        return res.send({ provider });

    }catch(err){
        console.log(err); 
        return err; 
    }
}



//Actualizar Proveedor //
exports.updateProvider = async (req, res)=>{
    try{
        const params = req.body;
        const providerID = req.params.id;

        const check = await checkUpdated(params);
        if(check === false) return res.status(400).send({message: 'Data not recived'});

        const msg = validateData(params);
        if(!msg)
        {
            //Verificación de Existencia de Proveedor
            const providerExist = await Provider.findOne({_id: providerID});
            if(!providerExist) return res.status.send({message: 'Provider not found'});

            if(providerExist.NIT == params.NIT){
                 //Update Proveedor
                const updateProvider = await Provider.findOneAndUpdate({_id: providerID}, params, {new: true});
                return res.send({message: 'Update Provider', updateProvider});
            }

            if(providerExist.NIT != params.NIT){
                //Verificación de existencia de nombre de proveedor
                const alreadyNIT = await Provider.findOne({$and: [{company: req.user.sub}, {NIT: params.NIT}]});
                if(alreadyNIT) return res.send({message: "NIT already in use"});

                if(!alreadyNIT){
                    //Update Proveedor
                    const updateProvider = await Provider.findOneAndUpdate({_id: providerID}, params, {new: true});
                    return res.send({message: 'Update Provider', updateProvider});
                }
            
            }

        }else return res.status(400).send({message: 'Some parameter is empty'})

        }catch(err){
        console.log(err);
        return err; 
    }
}




//Eliminar un Proveedor //
exports.deleteProvider = async (req, res)=>{
    try{
        const providerID = req.params.id;

        //Verificar la existencia del Proveedor
        const providerExist = await Provider.findOne({_id: providerID});
        if(!providerExist) return res.status(400).send({message: 'Provider not found or already deleted.'});   
     

        //- Verificar que el Proveedor DEFAULT se conserve.//
        if(providerExist.name === 'DEFAULT') return res.send({message: 'Default category cannot be deleted.'});

        //- Capturar la Variable DEFAULT
        const newCategory = await Provider.findOne({name:'DEFAULT'}).lean();

        //- Buscar todos los Productos con ese Proveedor.
        const inventorys = await Inventory.find({provider: providerID});

        if(inventorys == undefined){ }
        for(let arreglo of inventorys){
            const updateProvider = await Inventory.findOneAndUpdate({_id: arreglo._id},{provider: newCategory._id});
        }

        //Eliminación de Proveedor
        const providerDeleted = await Provider.findOneAndDelete({_id: providerID});
        return res.send({message: 'Delete Provider.', providerDeleted});
          
    }catch(err){
        console.log(err); 
        return err; 
    }
}
