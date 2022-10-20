'use strict'

const User = require('../models/user.model');
const Branch = require('../models/branch.model');
const Company = require('../models/company.model');

const { validateData, encrypt, alreadyUser, checkPassword} = require('../utils/validate');
const jwt = require('../middlewares/jwt');

//FUNCIONES PÚBLICAS

//Función de Testeo
exports.userTest = async (req, res) => {
    await res.send({ message: 'User Test is running.' })
}



//INICIAR SESIÓN//
exports.login = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            username: params.username,
            password: params.password
        }
        let msg = validateData(data);

        if (msg) return res.status(400).send(msg);
        let already = await alreadyUser(params.username);
        if (already && await checkPassword(data.password, already.password)) {
            let token = await jwt.createToken(already);
            delete already.password;

            //console.log(createConversion(1))
            return res.send({ message: "Inicio de Sesión Éxitoso.", already, token });

        } else return res.status(401).send({ message: "Credenciales Inválidas" });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: "Error al realizar el Inicio de Sesión."});
    }
}


//Función para crear usuarios
exports.AddUserByAdminCompany = async (req, res) => {
    try {
        const params = req.body;
        const userExist = await User.findOne({_id: req.user.sub});
      
        //Datos necesarios par ael registro 
        const data = {

            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            phone: params.phone,
            role: 'USUARIO',
            branch: params.branch,
            company: userExist.company
        };

        //Validación de Data
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Validación de existencia de La sucursal  
        const branchExist = await Branch.findOne({_id: data.branch});
        if(!branchExist) return res.send({message: "La sucursal no encontrada."});

        //Validación de Nombre de usuario
        let already = await User.findOne({$and: [{username: data.username},{company: userExist.company}]});
        if (already) return res.status(400).send({ message: "Nombre de Usuario ya existente." });

        //Encriptación de contraseña
        data.password = await encrypt(params.password);

        //Guardado de Usuario
        const user = new User(data);
        await user.save();
        return res.send({ message: "Usuario creado con éxito." , user});

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: "Error al guardar el usuario." });
    }
}


//Buscar User por Nombre
exports.searchUserByName = async (req, res) => {
    try {
        const params = req.body;
        const userExist = await User.findOne({_id: req.user.sub});
        const data = {
            name: params.name
        }

        const users = await User.find({$and:[{ name: { $regex: data.name, $options: 'i' }}, {company: userExist.company}]});
        if(users)return res.send({ message: "Usuarios encontrados", users });
        if(!users) return res.send({message: "Usuarios no encontrados."});

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Error al buscar lo usuarios.", err });
    }
}



//Mostar todos los Usuarios 
exports.getUsers = async (req, res) => {
    try {

        const userExist = await User.findOne({_id: req.user.sub});

        const users = await User.find({$and:[ {company: userExist.company}, { $or: [{ role: 'USUARIO' }, { role: 'GERENTE' }] }]});
        if (!users) return res.status(400).send({ message: "Usuarios no enconstrados o no existen." })
        else return res.send({ message: "Usuarios encontrados:", users });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ message: "Error al buscar los usuarios.", err });
    }
}




//FUNCIONES PRIVADAS
//Admins Company
exports.updateAccount = async (req, res) => {
    try {
        const userId = req.params.id;
        const params = req.body;
        const user = await User.findOne({_id: req.user.sub});

        //Validación de verificación de existencia de Usuario
        const userExist = await User.findOne({$and:[{ _id: userId }, {company: user.company}]});
        if (!userExist) return res.send({ message: "Usuario no encontrado." });

        //Validación de actualización de otro ADMIN
        if (userExist.role == 'ADMIN' || userExist.role == 'COMPANY'|| userExist.role == 'GERENTE') return res.status(403).send({ message: "No posees permiso para actualizar este Usuario."});

        if(userExist.username == params.username){

            if(params.branch != undefined || params.branch != null){
                //Validación de existencia de La sucursal  
                const branchExist = await Branch.findOne({$and: [{_id: params.branch}, {company: user.company}]});
                if(!branchExist) return res.send({message: "La sucursal no encontrada."});
            }

            //Actualización de Usuario
            const userUpdate = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
            if (userUpdate) return res.send({ message: "Usuario Actualizado:", userUpdate });
            else return res.send({ message: "El usuario no ha sido Actualizado."  });

        }


        if(userExist.username != params.username){

            //Validación de Username ya en uso
            const alreadyname = await User.findOne({$and: [{username: params.username}, {company: user.company}]});
            if (alreadyname) return res.status(400).send({ message: "Nombre de Usuario ya existente." });

            if(params.branch != undefined || params.branch != null){
                //Validación de existencia de La sucursal  
                const branchExist = await Branch.findOne({$and: [{_id: params.branch}, {company: user.company}]});
                if(!branchExist) return res.send({message: "La sucursal no ha sido encontrada."});
            }

            //Actualización de Usuario
            const userUpdate = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
            if (userUpdate) return res.send({ message: "Usuario Actualizado:", userUpdate });
            else return res.send({ message: "El usuario no ha sido Actualizado." });

        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: "Error al intentar Actualizar al Usuario." });
    }
}


//FUNCION DE ELIMINACIÓN DE USUARIO POR ADMIN DE COMPANY 
exports.deleteUser = async (req, res) => {
    try {
        const userID = req.params.id;

        //Validación de eleminación de usuario propio 
        const persmission = await User.findOne({_id: userID});
        if(!persmission) return res.send({message: "Usuario no encontrado."});
        if (persmission.role === 'COMPANY' ||persmission.role === 'ADMIN' ||persmission.role === 'GERENTE') return res.status(403).send({ message:"No tienes permiso para eliminar este usuario." });
        
        //Eliminación de Usuario
        const userDeleted = await User.findOneAndDelete({ _id: userID });
        if (userDeleted) return res.send({ message: "Cuenta Eliminada:", userDeleted });
        else return res.send({ message: "Usuario no encontrado o ya ha sido eliminado." });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message:"Error al eliminar el usuario." });
    }
}




//*---------------------------------------FUNCIONES DE ADMIN GENERAL --------------------------------------------------------*//

//FUNCIONES PRIVADAS
//ADMIN

exports.AddUserByAdmin = async (req, res) => {
    try {
        const params = req.body;
        const data = {

            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            phone: params.phone,
            role: params.role,
            branch: params.branch,
            company: params.company
        };

        //Validación de Data
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Validación de existencia de la Empresa 
        const companyExist = await Company.findOne({_id: data.company});
        if(!companyExist) return res.send({message: "Empresa no encontrada."});

        //Validación de existencia de La sucursal  
        const branchExist = await Company.findOne({_id: data.branch});
        if(!branchExist) return res.send({message: "La sucursal no encontrada."});

        //Validación de Nombre de usuario
        const already = await User.findOne({$and: [{username: data.username}, {company: companyExist._id}]});
        if (already) return res.status(400).send({ message: "Nombre de Usuario ya existente" });

        //Encriptación de contraseña
        data.password = await encrypt(params.password);

        const user = new User(data);
        await user.save();
        return res.send({ message: "Usuario creado  con exito." , user});
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: "Error al guardar el usuario." });
    }
}


//FUNCIONES PRIVADAS
//Usuarios
exports.updateAccountByAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const params = req.body;

        //Validación de verificación de existencia de Usuario
        const userExist = await User.findOne({ _id: userId });
        if (!userExist) return res.send({ message: "Usuario no encontrado." });

        //Validación de actualización de otro ADMIN
        if (userExist.role == 'ADMIN') return res.status(403).send({ message: "No posees permiso para actualizar este Usuario."});

        if(userExist.username == params.username){
            
            if(params.company != undefined || params.company != null ){
                //Validación de existencia de la Empresa 
                const companyExist = await Company.findOne({_id: params.company});
                if(!companyExist) return res.send({message: "Empresa no encontrada."});
            }

            if(params.branch != undefined || params.branch != null){
                //Validación de existencia de La sucursal  
                const branchExist = await Branch.findOne({$and: [{_id: params.branch}, {company: userExist.company}]});
                if(!branchExist) return res.send({message: "La sucursal no encontrada."});
            }

            //Actualización de Usuario
            const userUpdate = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
            if (userUpdate) return res.send({ message: "Usuario Actualizado:", userUpdate });
            else return res.send({ message: "El usuario no ha sido Actualizado."  });

        }


        if(userExist.username != params.username){

            //Validación de Username ya en uso
            const alreadyname = await User.findOne({$and: [{username: params.username}, {company: userExist.company}]});
            if (alreadyname) return res.status(400).send({ message: "Nombre de Usuario ya existente en la Empresa." });


            if(params.company != undefined || params.company != null ){
                //Validación de existencia de la Empresa 
                const companyExist = await Company.findOne({_id: params.company});
                if(!companyExist) return res.send({message: "Empresa no encontrada."});
            }

            if(params.branch != undefined || params.branch != null){
                //Validación de existencia de La sucursal  
                const branchExist = await Branch.findOne({$and: [{_id: params.branch}, {company: userExist.company}]});
                if(!branchExist) return res.send({message: "La sucursal no ha sido encontrada."});
            }

            //Actualización de Usuario
            const userUpdate = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
            if (userUpdate) return res.send({ message: "Usuario Actualizado:", userUpdate });
            else return res.send({ message: "El usuario no ha sido Actualizado." });

        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: "Error al intentar Actualizar al Usuario." });
    }
}



//FUNCION DE ELIMINACIÓN DE USUARIO PROPIO 
exports.deleteUserByAdmin = async (req, res) => {
    try {
        const userID = req.params.id;

       //Validación de eleminación de usuario propio 
       const persmission = await User.findOne({_id: userID});
       if(!persmission) return res.send({message: "Usuario no encontrado."});
       if(persmission.role === 'ADMIN') return res.status(403).send({ message: "No posees permiso para actualizar ente usuario." });
        
        //Eliminación de Usuario
        const userDeleted = await User.findOneAndDelete({ _id: userID });
        if (userDeleted) return res.send({ message: "Cuenta Eliminada:", userDeleted });
        else return res.send({ message: "Usuario no encontrado o ya ha sido eliminado." });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: "Error al eliminar el usuario." });
    }
}



//FUNCIÓN DE ACTUALIZAR PASSWORD
exports.changePasswordByAdmin = async (req, res) => {
    
    const userID = req.params.id;

    //INGRESAR CONTRASEÑA PARA ELIMINAR//
    const params = req.body;
    const password = params.password;
    const newPassword = params.newPassword;

    const data =
    {
        password: password,
        newPassword: newPassword
    }

    //Validación de Data
    let msg = validateData(data);
    if (msg) return res.status(400).send(msg);

    //Verificación de existencia de usuario
    const userExist = await User.findOne({ _id: userID });
    if(userExist.role === 'ADMIN') return res.status(403).send({ message: "No posees poermiso para cambiar la contraseña de este usuario." });
    if (userExist && await checkPassword(password, userExist.password)) { data.newPassword = await encrypt(params.newPassword);
        
        //Funcion de cambio de password
        const changePassword = await User.findOneAndUpdate(
            { _id: userID }, { password: data.newPassword }, { new: true })
        return res.send({ message: "Contraseña actualizada con éxito." })
    }
    else {
        return res.status(400).send({ message: "La contraseña no es correcta." })
    }
}





//-------------------------------------FUNCIONES DE BUSQEDA Y MOSTRAR USUARIOS--------------------------------------------------------//

//Mostrar un usuario en Específico
exports.getUserByAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(400).send({ message: "Usuario no encontrado." });
        else return res.send({ message: "Usuario Encontrado:", user });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "Error buscando al usuario.", err });
    }
};


//Buscar User por Nombre
exports.searchUserByNameByAdmin = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name
        }

        const users = await User.find({ name: { $regex: params.name, $options: 'i' } });
        return res.send({ message: "Usuarios enconstrados: ", users });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Error buscando a los usuarios.", err });
    }
}


//Mostar todos los Usuarios 
exports.getUsersByAdmin = async (req, res) => {
    try {
        const users = await User.find({ });
        if (!users) return res.status(400).send({ message: "Usuario no encontrado." })
        else return res.send({ message: "Usuario enconstrado: ",  users });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ message: "Error buscando al usuario.", err });
    }
}




//Mostar todos los Usuarios De una Empresa
exports.getUsersCompanyByAdmin = async (req, res) => {
    try {
        const companyID =  req.params.id;
        const users = await User.find({company: companyID });
        if (!users) return res.status(400).send({ message: "Usuario no encontrado o no existe." })
        else return res.send({ message: "Usuario encontrado:", users });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ message: "Error buscando usuario.", err });
    }
}
