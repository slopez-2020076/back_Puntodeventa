'use strict'

const TypePayment = require('../models/typePayment.model');
const Company =  require('../models/company.model')
const Payment = require('../models/payments.model');
const { validateData, checkUpdated} = require('../utils/validate');


//Función de Testeo//
exports.testTypePayment = (req, res)=>{
    return res.send({message: 'Function test is running'}); 
}




//Agregar TypePayment//
exports.saveTypePayment = async (req, res)=>{
    try{
        const params = req.body; 
        const data = {
            name: params.name,
            description: params.description,
            company: params.company

        };

        //Validación de Data
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        

        //Verificación de la existencia de la compania//
        const companyExist = await Company.findOne({_id: data.company});
        if(!companyExist) return res.send({message: "Company not found"});


        //Verificación de existencia del Tipo De Pago//
        const typePaymentExist = await TypePayment.findOne({$and:[ {name: params.name}, {company: data.company}]});
        if(!typePaymentExist){
            const typePayment = new TypePayment(data);
            await typePayment.save();
            return res.send({message: 'TypePayment saved', typePayment});
        }else return res.status(400).send({message: 'TypePayment already exist'});
    
    }catch(err){
        console.log(err); 
        return err; 
    }
}



//Mostrar todos los tipos de Pago//
exports.getsTypePayments = async (req, res)=>{
    try{
        const typePayment = await TypePayment.find();
        return res.send({message: 'TypePayment:', typePayment});
    }catch(err){
        console.log(err); 
        return err; 
    }
}



//Mostrar todos los tipos de Pago//
exports.getTypePayment = async (req, res)=>{
    try{
        const typePayment = await TypePayment.find();
        return res.send({message: 'TypePayment:', typePayment});
    }catch(err){
        console.log(err); 
        return err; 
    }
}




//Mostrar un tipo de Pago//
exports.getTypepPaymentsByCompany = async (req, res)=>{
    try
    {
        const companyID = req.params.id
        const typePayment = await TypePayment.findOne({company: companyID});
        if(!typePayment)  return res.send({message: "TypePayment not found."})
        return res.send({message: 'TypePayment:', typePayment})
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Actualizar un typo de Pago //
exports.updateTypePayment = async (req, res)=>{
    try{
        const params = req.body;
        const typePaymentID = req.params.id;

        
        const check = await checkUpdated(params);
        if(check === false) return res.status(400).send({message: 'Data not recived'});

        const msg = validateData(params);
        if(!msg)
        {

            const typePaymentExist = await TypePayment.findOne({_id: typePaymentID});
            if(!typePaymentExist) return res.send({message: "TypePaymen not found"});

           //Verificación de existencia de nombre del tipo de pago             
            if(typePaymentExist.name == params.name){

                if(params.company != undefined || params.company != null){
                    const existCompany = await Company.findOne({_id: params.company});
                    if(!existCompany ) return res.status(400).send({message: 'Company not exist.'});
                }
                //Update tipo de Pago
                const updateTypePayment = await TypePayment.findOneAndUpdate({_id: typePaymentID}, params, {new: true});
                return res.send({message: 'Update TypePayment', updateTypePayment});

            }
          
            if(typePaymentExist.name != params.name){
                const alreadyName = await TypePayment.findOne({$and:[{name: params.name}, {company: typePaymentExist.company}]});
                console.log (alreadyName)
                if(alreadyName ) return res.send({message: 'TypePayment Already Exist or Name already in use'});
                
                if(!alreadyName){
                    if(params.company != undefined || params.company != null){
                        const existCompany = await Company.findOne({_id: params.company});
                        if(!existCompany ) return res.status(400).send({message: 'Company not exist.'});
                    }
                    //Update tipo de Pago
                    const updateTypePayment = await TypePayment.findOneAndUpdate({_id: typePaymentID}, params, {new: true});
                    return res.send({message: 'Update TypePayment', updateTypePayment});
                } 
 
            }
        
        }else return res.status(400).send({message: 'Some parameter is empty'});

        }catch(err){
        console.log(err);
        return err; 
    }
}




//Eliminar un tipo de Pago  //
exports.deleteTypePayment = async (req, res)=>{
    try{
        const typePaymentID = req.params.id;

        //Verificar la existencia del tipo de Pago
        const typePaymentExist = await TypePayment.findOne({_id: typePaymentID});
        if(!typePaymentExist) return res.status(400).send({message: 'TypePayment not found or already deleted.'});   
     

        //- Verificar que el Proveedor DEFAULT se conserve.//
        if(typePaymentExist.name === 'EFECTIVO') return res.send({message: 'Default category cannot be deleted.'});

        //Eliminación del tipo de Pago 
        const typePaymentDeleted = await TypePayment.findOneAndDelete({_id: typePaymentID});
        return res.send({message: 'Delete TypePayment.', typePaymentDeleted});
          
    }catch(err){
        console.log(err); 
        return err; 
    }
}
