'use strict'

const Client = require('../models/client.model');
const User = require('../models/user.model');

const { validateData  } = require('../utils/validate');
const jwt = require('../middlewares/jwt');

//FUNCIONES PÚBLICAS
exports.clientTest = async (req, res) => {
    await res.send({ message: 'Client Test is running.' })
}


exports.AddClient = async (req, res) => {
    try {
        const params = req.body;
        const userExist = await User.findOne({ _id: req.user.sub });
       

        const data = {

            name: params.name,
            surname: params.surname,
            NIT: params.NIT,
            role: 'CLIENT',
            company: userExist.company
        };

        //Validación de Data
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Validación de NIT de usuario
        let already = await Client.findOne({ $and: [{NIT: params.NIT}, { company: userExist.company }] });
        if (already) return res.status(400).send({ message: 'NIT already in use' });

        let client = new Client(data);
        await client.save();

        return res.send({ message: 'Client created successfully' , client});
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving client' });
    }
}




//Function Update Client
exports.updateClient = async (req, res) => {
    try {
        const clientID = req.params.id;
        const params = req.body;

        //Validación de eleminación de usuarioAdmin
        const persmission = await Client.findOne({_id: clientID});
        if (persmission.role == 'COMPANY' || persmission.role == 'ADMIN' || persmission.role == ' USUARIO '|| persmission.role == ' GERENTE ') return res.status(403).send({ message: 'You dont have permission to update this user' });
        
        //Validación de existencia de Cliente 
        const clientExist = await Client.findOne({ _id: clientID });
        if (!clientExist) return res.status(401).send({ message: 'Client not found' });

        if(clientExist.NIT == params.NIT){
            //Actualización de Cliente
            const clientUpdate = await Client.findOneAndUpdate({ _id: clientID }, params, { new: true }).lean();
            if (clientUpdate) return res.send({ message: 'User updated', clientUpdate });
            else return res.send({ message: 'Client not updated' });
        }
        

        if(clientExist.NIT != params.NIT){
            //Validación de NIT ya en uso
            const alreadyname = await Client.findOne({ NIT: params.NIT });
            if (alreadyname) return res.status(400).send({ message: 'NIT already in use' });

            else{
                //Actualización de Cliente
                const clientUpdate = await Client.findOneAndUpdate({ _id: clientID }, params, { new: true }).lean();
                if (clientUpdate) return res.send({ message: 'User updated', userUpdate });
                else return res.send({ message: 'Client not updated' });
            }
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Failed to update client' });
    }
}





//FUNCION DE ELIMINACIÓN DE CLIENTE
exports.deleteUser = async (req, res) => {
    try {
        const clientID = req.params.id;

        //Eliminación de Cliente
        const clientDeleted = await Client.findOneAndDelete({ _id: clientID });
        if (clientDeleted) return res.send({ message: 'Client deleted', clientDeleted });
        if(!clientDeleted)return res.send({ message: 'Client not found or already deleted' });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting Client' });
    }
}


//FUNCION PARA MOSTRAR TODOS LOS CLIENTES DE LA EMPRESA
exports.getClientsByCompany = async (req, res)  => {
    try{

        const user = await User.findOne({ _id: req.user.sub});

        const clients = await Client.find({company: user.company});
        if (!clients) return res.send({message: 'Clients not Founds.'});
        else return res.send({ message: 'Clients Found:', clients });

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error geting Clients.'});
    }
}



//FUNCION PARA MOSTRAR UN CLIENTE
exports.getClient = async (req, res)  => {
    try{

        const clientID = req.params.id;

        const client = await Client.findOne({_id: clientID});
        if (!client) return res.send({message: 'Client not Found.'});
        else return res.send({ message: 'Client Found:', client });

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error geting Client.'});
    }
}



//FUNCION PARA MOSTRAR UN CLIENTE POR NIT
exports.getClientNIT = async (req, res)  => {
    try{
        const params = req.body;

        const clientExist = await Client.findOne({NIT: params.NIT});
        if(!clientExist) return res.send({message: "Client not found "});
        else return res.send({ message: 'Client Found:', clientExist });

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error geting Client.'});
    }
}



//FUNCION PARA MOSTRAR TODOS LOS CLIENTES 
exports.getClients = async (req, res)  => {
    try{

        const clients = await Client.find();
        if (!clients) return res.send({message: 'Clients not Founds.'});
        else return res.send({ message: 'Clients Found:', clients });

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error geting Clients.'});
    }
}


//FUNCION PARA MOSTRAR UN CLIENTE POR NOMBRE
exports.getClientByName = async (req, res)  => {
    try{
        const params = req.body;

        const clientExist = await Client.find({ name: { $regex: params.name, $options: 'i' } });
        if(!clientExist) return res.send({message: "Client not found "});
        else return res.send({ message: 'Client Found:', clientExist });

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error geting Client.'});
    }
}