'use strict'

const Branch = require('../models/branch.model');
const Warehouse = require('../models/warehouse.model');

const {validateData} = require('../utils/validate');

//FUNCIONES PÚBLICAS
//Función de Testeo//
exports.wareHouseTest = async (req, res)=>{
    await res.send({message: 'WareHouses Test is running.'})
}



//Agregar una Bodega//
exports.saveWarehouse = async(req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name,
            description: params.description,
            address: params.address,
            branch: params.branch,
            company:  req.user.sub,
            
        };
        
        //Validar data obligatoria
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);


        //Verificar que si la bodega ya ha sido creada
        const warehouseExist = await Warehouse.findOne({$and: [{name: data.name},{ branch: data.branch}]});
        if(warehouseExist) return res.status(400).send({message: 'Warehouse already created'});


        //Agregar una nueva Bodega//
        const wareHouse = new Warehouse(data);
        await wareHouse.save();
        return res.send({message: 'Warehouse created successfully', wareHouse});

    }catch(err){
        console.log(err);
        return err;
    }
}




//ACTUALIZAR UNA BODEGA//
exports.updateWarehouse = async (req, res) =>{
    try{
        const warehouseID = req.params.id;
        const params = req.body;
        
        const warehouseExist = await Warehouse.findOne({_id: warehouseID});
        if(!warehouseExist) return res.send({message: "Warehouse not Found."});


        if(warehouseExist.name == params.name){
            
            if(params.branch != undefined || params.branch != null){
                const existBranch = await Branch.findOne({_id: params.branch});
                if(!existBranch ) return res.status(400).send({message: 'Branch not exist.'});
            }

            //Actualización de la Bodega
            const wareHouseUpdate = await Warehouse.findOneAndUpdate({_id: warehouseID}, params, {new: true}).lean();
            if(!wareHouseUpdate) return res.send({message: 'Warehouse not updated'});
            return res.send({message: 'WareHouse updated', wareHouseUpdate});

        }

        if(warehouseExist.name != params.name){
            //Verificación de la existencia de nombre de la bodega
            const nameWarehouse = await Warehouse.findOne({$and: [{name: params.name}, { branch: warehouseExist.branch }]});
            if( nameWarehouse) return res.send({message: " Name warehouse alredy exist in the branch.."});

            if(!nameWarehouse){
                if(params.branch != undefined || params.branch != null){
                    const existBranch = await Branch.findOne({_id: params.branch});
                    if(!existBranch ) return res.status(400).send({message: 'Branch not exist.'});
                }
    
                //Actualización de la Bodega
                const wareHouseUpdate = await Warehouse.findOneAndUpdate({_id: warehouseID}, params, {new: true}).lean();
                if(!wareHouseUpdate) return res.send({message: 'Warehouse not updated'});
                return res.send({message: 'WareHouse updated', wareHouseUpdate});
            }
        }
        

        

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update warehouse'});
    }
}




//ELIMAR UNA BODEGA//
exports.deleteWarehouse = async(req, res)=>{
    try{
        const wareHouseID = req.params.id;

        //Eliminación de la Bodega
        const wareHouseDelete = await Warehouse.findOneAndDelete({ _id: wareHouseID });
        if (!wareHouseDelete) return res.send({ message: 'Warehouse not found or already deleted' });
        return res.send({ message: 'Warehouse deleted', wareHouseDelete });
    
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting Warehouse'});
    }
}



//MOSTRAR TODAS LAS BOEDGAS//
exports.getsWarehouse = async(req, res)=>{
    try{
     
        //Eliminación de la Bodega
        const warehouses = await Warehouse.find();
        if(warehouses.length === 0) return res.send({message: 'Warehouses not found or already deleted'});
        return res.send({message: 'Warehouses', warehouses});

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error getting Warehouse'});
    }
}




//Visualizar un Producto//
exports.getWarehouse = async (req, res) => {
    try {

        const wareHouseID = req.params.id;
        const searchWarehouse = await Warehouse.findOne({ _id: wareHouseID });

        //- Verificar que Exista el Producto.//
        if (!searchWarehouse) return res.status(500).send({ message: 'Warehouse not found.' });
        return res.send({ message: 'Warehouse Found:', searchWarehouse });

    } catch (err) {
        console.log(err);
        return err;
    }
}



//Ver bodegas por NAME//
exports.warehouseByName = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name
        };

        //Validar que llegue el Nombre de la bodega//
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //- Verificar que Exista la Bodega.//
        const warehouseName = await Warehouse.find({ name: { $regex: params.name, $options: 'i' } }).lean();
        if (!warehouseName) return res.status(500).send({ message: 'Warehouse not found.' })
        return res.send({ message: 'Warehouses Found:', warehouseName });
    } catch (err) {
        console.log(err);
        return err;
    }
}


//Ver bodegas por Sucursal//
exports.wareHouseByBranch = async (req, res) => {
    try {
        const branchID = req.params.id;
    
        //- Verificar que Exista la Bodega.//
        const warehouseName = await Warehouse.find({ branch: branchID});
        if (!warehouseName) return res.status(500).send({ message: 'Warehouses not found.' })
        return res.send({ message: 'Warehouses Found:', warehouseName });
    } catch (err) {
        console.log(err);
        return err;
    }
}










