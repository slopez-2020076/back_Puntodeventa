'use strict';


//Importación de los Modelos -Productos-
const Turn = require('../models/turn.model');
const User = require('../models/user.model');

//Importación del Modelo -Orden-
const Branch = require('../models/branch.model');
const Company = require('../models/company.model');


const { validateData } = require('../utils/validate');

//Función de testeo de Orden 
exports.testTurn = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}



//Función para enviar una OrdenInventory
exports.saveTurn = async (req, res) => {
    try {
        
        const params = req.body;
        const startTurn = new Date(params.startDate);
        const endTurn = new Date(params.endTurn);
        const endDate = new Date(params.endDate);
        const startDate = new Date(params.startDate);

        const companyID = req.user.sub;
        const company = await Company.findOne({_id: companyID});

        const data = {
            area: params.area,
            startTurn: params.startTurn,
            endTurn: params.endTurn,
            startDate: params.startDate,
            endDate: params.endDate,
            branch: params.branch,
            company: req.user.sub
        };


        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //VERIFICAR FECHAS VALIDAS//
        if (startTurn > endTurn) return res.status(400).send({ message: 'Hours Turn not Correct.' });
        if (startDate > endDate) return res.status(400).send({ message: 'Dates Turn not Correct.' });


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

        //Split de Horas
        /*PARAMETRO DE ENTRADA DATA*/
        const hourLocalOne = new Date();
        const hourLocal = (hourLocalOne).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitHour = hourLocal.split(' ');
        const splitHourOne = splitHour[1].split(':');
        if (splitHourOne[0] < 10) {
            splitHourOne[0] = '0' + splitHourOne[0];
        }
        if (splitHourOne[1] < 10) {
            splitHourOne[1] = '0' + splitHourOne[1];
        }
        const setHour = splitHourOne[0] + ':' + splitHourOne[1] + ':' + splitHourOne[2];
        const hourNow = new Date(setHour);


        if (startTurn < hourNow || endTurn < hourNow) return res.status(400).send({ message: 'Hours Turns Not Correct.' });
        if (startDate < dateNow || endDate < dateNow) return res.status(400).send({ message: 'Dates Turns Not Correct.' })

        const turnExist = await Turn.findOne({$and: [{ company: company._id }, {branch: data.branch}, { startTurn: data.startTurn }, {area: data.area}, {startDate: data.startDate}]});
        if(!turnExist) return res.send({message: "Turn not found"});
        
        const companyExist = await Company.findOne({_id: data.company});
        if(!companyExist) return res.send({message: "Company not found"});

        const branchExist = await Branch.findOne({_id: data.branch});
        if(!branchExist) return res.send({message: "Branch not found"});


        //Creación de Orden
        const addTunr = new Turn(data);
        await addTunr.save();

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando la La Orden.' });
    }
}



//Función para actualizar Turno
exports.updateTurn = async (req, res) => {
    try {
        
        const params = req.body;
        const startTurn = new Date(params.startTurn);
        const endTurn = new Date(params.endTurn);
        const endDate = new Date(params.endDate);
        const startDate = new Date(params.startDate);


        const companyID = req.user.sub;
        const company = await Company.findOne({_id: companyID});

        const data = {
            area: params.area,
            startTurn: params.startTurn,
            endTurn: params.endTurn,
            startDate: params.startDate,
            endDate: params.endDate,
            branch: params.branch
        };


        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar con Fecha Actual//
          //VERIFICAR FECHAS VALIDAS//
          if (startTurn > endTurn) return res.status(400).send({ message: 'Hours Turn not Correct.' });
          if (startDate > endDate) return res.status(400).send({ message: 'Dates Turn not Correct.' });
  

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

        //Split de Horas
        /*PARAMETRO DE ENTRADA DATA*/
        const hourLocalOne = new Date();
        const hourLocal = (hourLocalOne).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitHour = hourLocal.split(' ');
        const splitHourOne = splitHour[1].split(':');
        if (splitHourOne[0] < 10) {
            splitHourOne[0] = '0' + splitHourOne[0];
        }
        if (splitHourOne[1] < 10) {
            splitHourOne[1] = '0' + splitHourOne[1];
        }
        const setHour = splitHourOne[0] + ':' + splitHourOne[1] + ':' + splitHourOne[2];
        const hourNow = new Date(setHour);


        if (startTurn < hourNow || endTurn < hourNow) return res.status(400).send({ message: 'Hours Turns Not Correct.' });
        if (startDate < dateNow || endDate < dateNow) return res.status(400).send({ message: 'Dates Turns Not Correct.' })


        const turnExist = await Turn.findOne({$and: [{ company: company._id }, {branch: data.branch}, { startTurn: data.startTurn }, {area: data.area}, {startDate: data.startDate}]});
        if(!turnExist) return res.send({message: "Turn not found"});

        const branchExist = await Branch.findOne({_id: data.branch});
        if(!branchExist) return res.send({message: "Branch not found"});


        //Creación del Turno
        const addTunr = new Turn(data);
        await addTunr.save();

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando el Turn.' });
    }
}





//Función para eliminar un Turno
exports.deleteTurn = async (req, res) => {
    try {
        
        const turnID  = req.params.id;

        const turnExist = await Turn.findOne({$and: [{ company: companyID }, {area: data.area}, {_id: turnID}]});
        if(!turnExist) return res.send({message: "Turn not found"});

        const deleteTurn = await Turn.findOneAndDelete({_id: turnID});
        if(!deleteTurn) return res.send({message: "Turn not found or alredy deleted"});
        

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando el Turn.' });
    }
}



//Función para mostar los usuarios de un Turno
exports.getusers = async (req, res) => {
    try {
        
        const turnID  = req.params.id;
        const companyID = req.user.sub;

        const turnExist = await Turn.find({$and: [{ company: companyID }, {_id: turnID}]});
        if(!turnExist) return res.send({message: "Turn not found"});

        const users = turnExist.users;
        return res.send({message: "Users:", users});

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando el Turn.' });
    }
}





//Funcion para agregar un usuario al turno 
exports.addUser = async (req, res) => {
    try {
        const turnID = req.params.id;
        const companyID = req.user.sub;
        const company = await Company.findOne({_id: companyID});

        const params = req.body;
        const data = {
            users: params.user

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Usuario//
        const userExist = await User.findOne({ $and: [{ _id: params.user }, { company: company }] });
        if (!userExist) return res.status(400).send({ message: 'User not found' });


        //Verificar que Exista el Turno //
        const turnExist = await Turn.findOne({ _id: turnID });
        if (!turnExist) return res.status(400).send({ message: 'Turn not found' });

      
        //Seteo de datos del producto
        const setUser =
        {
            users: data.users
        }

        //Array de los usuarios de cada turno
        const users = turnExist.users
        for (let user of users) {
         
            //Verificar que Exista en el turno //
            const userExistTurn = await Turn.findOne({ 'users.user': user._id });
            if (userExistTurn) return res.status(400).send({ message: 'User  alredy exist in Turn.' });

            if(!userExistTurn) continue
        }

        const newUser = await Turn.findOneAndUpdate({ _id: turnExist._id },
            { $push: { users: setUser } }, { new: true });
        
        return res.send({ message: 'Added New User to Turn.', newUser })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error adding User.' });
    }
}





//Funcion para Eiminar un usuario al turno 
exports.deleteUser = async (req, res) => {
    try {
        const turnID = req.params.id;
        const companyID = req.user.sub;
        const company = await Company.findOne({_id: companyID});

        const params = req.body;
        const data = {
            users: params.user

        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Usuario//
        const userExist = await User.findOne({ $and: [{ _id: params.user }, { company: company }] });
        if (!userExist) return res.status(400).send({ message: 'User not found' });


        //Verificar que Exista el Turno //
        const turnExist = await Turn.findOne({ _id: turnID });
        if (!turnExist) return res.status(400).send({ message: 'Turn not found' });

      
        //Seteo de datos del producto
        const setUser =
        {
            users: data.users
        }

        //Array de los usuarios de cada turno
        const users = turnExist.users
        for (let user of users) {
         
            //Verificar que Exista en el turno //
            const userExistTurn = await Turn.findOne({ 'users.user': user._id });
            if (!userExistTurn) return res.status(400).send({ message: 'User  alredy exist in Turn.' });

            if(userExistTurn) continue
        }

        const newUser = await Turn.findOneAndUpdate({ _id: turnExist._id },
            { $pull: { users: setUser } }, { new: true });
        
        return res.send({ message: 'Deleted User to Turn.', newUser })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error Deeteng User.' });
    }
}


