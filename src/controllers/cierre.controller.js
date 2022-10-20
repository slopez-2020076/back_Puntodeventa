'use strict'

const Cierre = require('../models/cierre.model');
const { validateData, checkUpdated} = require('../utils/validate');


//Función de Testeo//
exports.testCierre = (req, res)=>{
    return res.send({message: 'Function test is running'}); 
}




//Agregar Proveedor//
exports.saveCierre = async (req, res)=>{
    try{
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

        const dataCierreGeneral = {
            EstadoDelDia: "ABIERTO",
            FechaDeApertura: setDateOrder,
            FechaDelCierre: "",
            HoraCierreGeneral: "",
            Caja: params.caja,
            branch: params.branch,
            CierresDelDia: [],
            user: req.user.sub,
        };


        //Validación de Data
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        //Verificación de Existencia de la Caja//
        const cajaExist = await PaymentBox.findOne({_id: dataCierreGeneral.Caja});
        if(!cajaExist) return res.send({message: "Caja not found"});

        //Verificación de Existencia de la Sucursal//
        const branchExist = await Branch.findOne({_id: dataCierreGeneral.branch});
        if(!branchExist) return res.send({message: "Branch not found"});

        //Verificación de existencia del Cierre
        const cierreExist = await Cierre.findOne($and[ {FechaDeApertura: setDateOrder}, {Caja: dataCierreGeneral.Caja}]);
        if(!cierreExist){
            const cierre = new Cierre(dataCierreGeneral);
            await cierre.save();
            return res.send({message: 'Cierre saved', cierre});
        }else return res.status(400).send({message: 'Cierre  already exist'});
    
    }catch(err){
        console.log(err); 
        return err; 
    }
}



//Mostrar todos los Cierrew//
exports.getsCierres = async (req, res)=>{
    try{
        const cierres = await Cierre.find();
        return res.send({message: 'Cierres:', cierres})
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Mostrar un  Cierre//
exports.getProvider = async (req, res)=>{
    try
    {
        const cierreID = req.params.id
        const cierre = await Cierre.findOne({_id: cierreID});
        return res.send({message: 'Cierre:', cierre});
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Actualizar Cierre //
exports.updateCierre = async (req, res)=>{
    try{
        const params = req.body;
        const cierreID = req.params.id;


        const data = {
            EstadoDelDia: "ABIERTO",
            FechaDeApertura: setDateOrder,
            FechaDelCierre: "",
            HoraCierreGeneral: "",
            Caja: params.caja,
            branch: params.branch,
        };


        const check = await checkUpdated(data);
        if(check === false) return res.status(400).send({message: 'Data not recived'});

        const msg = validateData(data);
        if(!msg)
        {
            //Verificación de Existencia deL Cierre//
            const cierreExist = await Cierre.findOne({_id: cierreID});
            if(!cierreExist) return res.status.send({message: 'Cierre not found'});

            //Verificación de Existencia de la Caja//
            const cajaExist = await PaymentBox.findOne({ _id: dataCierreGeneral.Caja });
            if (!cajaExist) return res.send({ message: "Caja not found" });

            //Verificación de Existencia de la Sucursal//
            const branchExist = await Branch.findOne({ _id: dataCierreGeneral.branch });
            if (!branchExist) return res.send({ message: "Branch not found" });

            //Update Cierre
            const updateCierre = await Cierre.findOneAndUpdate({_id: cierreID}, data, {new: true});
            return res.send({message: 'Update Cierre', updateCierre});

        }else return res.status(400).send({message: 'Some parameter is empty'})

        }catch(err){
        console.log(err);
        return err; 
    }
}




//Eliminar un Cierre //
exports.deleteCierre = async (req, res)=>{
    try{
        const cierreID = req.params.id;

        //Verificar la existencia del Cierre
        const cierreExist = await Cierre.findOne({_id: cierreID});
        if(!cierreExist) return res.status(400).send({message: 'Cierre not found or already deleted.'});   
     
        //Eliminación de Cierre
        const cierreDeleted = await Cierre.findOneAndDelete({_id: cierreID});
        return res.send({message: 'Delete Cierre.', cierreDeleted});
          
    }catch(err){
        console.log(err); 
        return err; 
    }
}
