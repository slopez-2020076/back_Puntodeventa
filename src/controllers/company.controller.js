'use strict'

const Company = require('../models/company.model');
const TypeCompany = require('../models/typeCompany.model');
const Branch = require('../models/branch.model');
const Inventory = require('../models/inventory.model');
const Bill = require('../models/biil.model');
const Client = require('../models/client.model');
const Cierres = require('../models/cierre.model');
const Order = require('../models/order.model');
const Products = require('../models/product.model');
const Turn = require('../models/turn.model');
const User = require('../models/user.model');

const { createConversion } = require('../middlewares/convert');
const { validateData, encrypt, alreadyCompany, checkPassword, checkUpdate, checkPermission, checkUpdateAdmin, validExtension,  checkUpdated} = require('../utils/validate');
const jwt = require('../middlewares/jwt');
const Convertor = require('../middlewares/convert');

//FUNCIONES PÚBLICAS
exports.companyTest = async (req, res) => {
    await res.send({ message: 'Company Test is running.' })
}


//REGISTRARSE//
exports.register = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            name: params.name,
            username: params.username,
            password: params.password,
            email: params.email,
            phone: params.phone,
            typeCompany: params.typeCompany,
            role: 'COMPANY'
        };
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const alreadyTypeCompany = await TypeCompany.findOne({ _id: data.typeCompany });
        if (!alreadyTypeCompany) return res.status(400).send({ message: 'Type company not found' });

        let alreadyUsername = await alreadyCompany(data.username);
        if (alreadyUsername) return res.status(400).send({ message: 'Username already in use' });

        let alreadyName = await Company.findOne({ name: data.name });
        if (alreadyName) return res.status(400).send({ message: 'Name already in use' });

        data.password = await encrypt(params.password);

        let company = new Company(data);
        await company.save();
        let companyView = await Company.findOne({ _id: company._id }).lean().populate('typeCompany');
        return res.send({ message: 'Company created successfully', companyView });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Company' });
    }
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
        let already = await alreadyCompany(params.username);
        if (already && await checkPassword(data.password, already.password)) {
            let token = await jwt.createToken(already);
            delete already.password;

            //console.log(createConversion(1))
            return res.send({ message: 'Login Successfully', already, token });

        } else return res.status(401).send({ message: 'Invalid Credentials' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Failed to login' });
    }
}



//FUNCIONES PRIVADAS//
//EMPRESA//

//ACTUALIZAR SU PROPIA EMPRESA//
exports.update = async (req, res) => {
    try {
        const companyId = req.params.id;
        const params = req.body;

        //Validación de actualización de su propia empresa
        const permission = await checkPermission(companyId, req.user.sub);
        if (permission === false) return res.status(401).send({ message: 'You dont have permission to update this company' });

        //Verificación de existencia de empresa
        const companyExist = await Company.findOne({ _id: companyId });
        if (!companyExist) return res.send({ message: 'Company not found' });

        //Validación de Actualización de parametros permitidos
        const validateUpdate = await checkUpdate(params);
        if (validateUpdate === false) return res.status(400).send({ message: 'Cannot update this information or invalid params' });


        if (companyExist.username == params.username || companyExist.name == params.name) {

            if (params.typeCompany != undefined || params.typeCompany != null) {
                const existCompany = await TypeCompany.findOne({ _id: params.typeCompany });
                if (!existCompany) return res.status(400).send({ message: 'TypeCompany not exist.' });
            }

            //Actualización de empresa
            const companyUpdate = await Company.findOneAndUpdate({ _id: companyId }, params, { new: true }).populate('typeCompany').lean();
            if (companyUpdate) return res.send({ message: 'Company updated', companyUpdate });
            else return res.send({ message: 'Company not updated' });

        }

        if (companyExist.username != params.username || companyExist.name != params.name) {
            //Verificación de existencia de username  
            const alreadyUsername = await alreadyCompany(params.username);
            if (alreadyUsername) return res.status(400).send({ message: 'Username already in use' });

            //Verificación de existencia de nombre de la empresa
            const alreadyName = await Company.findOne({ name: params.name });
            if (alreadyName) return res.status(400).send({ message: 'Name already in use' });

            if (!alreadyUsername || !alreadyName) {

                if (params.typeCompany != undefined || params.typeCompany != null) {
                    const existCompany = await TypeCompany.findOne({ _id: params.typeCompany });
                    if (!existCompany) return res.status(400).send({ message: 'TypeCompany not exist.' });
                }
                //Actualización de empresa
                const companyUpdate = await Company.findOneAndUpdate({ _id: companyId }, params, { new: true }).populate('typeCompany').lean();
                if (companyUpdate) return res.send({ message: 'Company updated', companyUpdate });
                else return res.send({ message: 'Company not updated' });
            }
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Failed to update company' });
    }
}



//ELIMINAR SU PROPIA EMPRESA//
exports.deleteCompany = async (req, res) => {
    try {

        const companyId = req.params.id;

        //INGRESAR CONTRASEÑA PARA ELIMINAR//
        const params = req.body;
        const password = params.password;
        const data = {
            password: password
        }

        //Validación de Data
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Eliminación de su propio Empresa
        const persmission = await checkPermission(companyId, req.user.sub);
        if (persmission === false) return res.status(403).send({ message: 'You dont have permission to delete this company' });


        //Validación de contraseña para eliminación 
        const companyExist = await Company.findOne({ _id: companyId });
        if (!companyExist) return res.send({ message: 'Company not found or already deleted' });
        if (companyExist && await checkPassword(password, companyExist.password)) {
            //Eliminación de FACTURAS
            const billExist = await Bill.find({ company: companyId });
            for (let billDeleted of billExist) { const branchDeleted = await Branch.findOneAndDelete({ company: companyId }); }

            //Eliminación de Sucursales
            const branchExist = await Branch.find({ company: companyId });
            for (let branchDeleted of branchExist) { const branchDeleted = await Branch.findOneAndDelete({ company: companyId }); }

            //Eliminación de Clientes
            const clientExist = await Client.find({ company: companyId });
            for (let clientDeleted of clientExist) { const closingDeleted = await Closing.findOneAndDelete({ company: companyId }); }

            //Eliminación de Cierres
            const closingExist = await Cierres.find({ company: companyId });
            for (let closingDeleted of closingExist) { const closingDeleted = await Cierres.findOneAndDelete({ company: companyId }); }

            //Eliminación de Inventario
            const inventoryExist = await Inventory.find({ company: companyId });
            for (let inventoryDeleted of inventoryExist) { const inventoryDeleted = await Inventory.findOneAndDelete({ company: companyId }); }

            //Eliminación de Ordenes
            const orderExist = await Order.find({ company: companyId });
            for (let orderDeleted of orderExist) { const orderDeleted = await Order.findOneAndDelete({ company: companyId }); }

            //Eliminación de Productos de la empresa
            const productExist = await Products.find({ company: companyId });
            for (let productDeleted of productExist) { const productDeleted = await Products.findOneAndDelete({ company: companyId }); }

            //Eliminación de Turnos
            const turnExisted = await Turn.find({ company: companyId });
            for (let turnDeleted of turnExisted) { const turnDeleted = await Turn.findOneAndDelete({ company: companyId }); }

            //Eliminación de Usuarios
            const userExist = await User.find({ company: companyId });
            for (let userDeleted of userExist) { const userDeleted = await User.findOneAndDelete({ company: companyId }); }

            //Eliminación de la Empresa
            const companyDeleted = await Company.findOneAndDelete({ _id: companyId }).populate('typeCompany');
            if (companyDeleted) return res.send({ message: 'Account deleted', companyDeleted });

        }

        return res.status(400).send({ message: 'The password is not correct' });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting company' });
    }
}



//FUNCIÓN DE ACTUALIZAR PASSWORD
exports.changePassword = async (req, res) => {

    const userID = req.params.id;

    //INGRESAR CONTRASEÑA PARA ELIMINAR//
    const params = req.body;
    const password = params.password;
    const newPassword = params.newPassword;

    const data = {
        password: password,
        newPassword: newPassword
    }

    //Validación de Data
    let msg = validateData(data);
    if (msg) return res.status(400).send(msg);

    //Validación de permiso de password
    const persmission = await checkPermission(userID, req.user.sub);
    if (persmission === false) return res.status(403).send({ message: 'You dont have permission to Change Password.' });

    //Verificación de existencia de usuario
    const userExist = await User.findOne({ _id: userID });
    if (userExist && await checkPassword(password, userExist.password)) {
        data.newPassword = await encrypt(params.newPassword);

        //Funcion de cambio de password
        const changePassword = await User.findOneAndUpdate(
            { _id: userID }, { password: data.newPassword }, { new: true })
        return res.send({ message: 'Password Updated Successfully' })
    }
    else {
        return res.status(400).send({ message: 'The password is not correct' })
    }
}



//BUSCAR LAS SUCURSALES//
exports.searchBranches = async (req, res) => {
    try {
        const companyId = req.user.sub;
        const getBranches = await Branch.find({ company: companyId });
        if (!getBranches) return res.status(400).send({ message: 'Branches Not Found' });

        for (let companyData of getBranches) {
            companyData.company.username = undefined;
            companyData.company.password = undefined
            companyData.company.email = undefined
            companyData.company.phone = undefined
            companyData.company.role = undefined
            companyData.company.typeCompany = undefined
            companyData.company.__v = undefined
            delete companyData.company._id;
        }
        if (!getBranches) return res.send({ message: 'Branches not found' });
        return res.send({ message: 'Branches Found:', getBranches });
    } catch (err) {
        console.log(err);
        return err;
    }
}


//BUSCAR UNA SUCURSAL//
exports.searchBranch = async (req, res) => {
    try {
        const companyId = req.user.sub;
        const branchId = req.params.id;
        const getBranch = await Branch.findOne({ $and: [{ _id: branchId }, { company: companyId }] });
        if (!getBranch) return res.status(400).send({ message: 'Branch Not Found' });

        getBranch.company.username = undefined;
        getBranch.company.password = undefined
        getBranch.company.email = undefined
        getBranch.company.phone = undefined
        getBranch.company.role = undefined
        getBranch.company.typeCompany = undefined
        getBranch.company.__v = undefined
        delete getBranch.company._id;

        if (!getBranch) return res.send({ message: 'Branch not found' });
        return res.send({ message: 'Branch Found:', getBranch });
    } catch (err) {
        console.log(err);
        return err;
    }
}



//------------------------------------------------------------------------------------------------------------//

//FUNCIONES EMPRESAS 
//ADMIN//

//REGISTRAR UNA EMPRESA//
exports.registerIsAdmin = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            name: params.name,
            username: params.username,
            password: params.password,
            email: params.email,
            phone: params.phone,
            typeCompany: params.typeCompany,
            role: params.role
        };

        //Validación de Data
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificación de existncia de tipo de Compañia
        const alreadyTypeCompany = await TypeCompany.findOne({ _id: data.typeCompany });
        if (!alreadyTypeCompany) return res.send({ message: 'Type company not found' });

        //Verificación de username ya existente
        let already = await alreadyCompany(data.username);
        if (already) return res.status(400).send({ message: 'Username already in use' });


        //Verificaión de nombre ya existente
        let alreadyName = await Company.findOne({ name: data.name });
        if (alreadyName) return res.status(400).send({ message: 'Name already in use' });

        data.password = await encrypt(params.password);

        //Creación de Empresa
        let company = new Company(data);
        await company.save();
        return res.send({ message: 'Company created successfully', company });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Company' });
    }
}



//ACTUALIZAR SU PROPIA EMPRESA//
exports.updateIsAdmin = async (req, res) => {
    try {
        // const companyId = req.params.id;
        const companyId = req.params.id
        const params = req.body;


        const check = await checkUpdated(params);
        if (check === false) return res.status(400).send({ message: 'Data not recived' });

        const msg = validateData(params);
        if (!msg) {

            //Verificación de existencia de empresa
            const companyExist = await Company.findOne({ _id: companyId });
            if (!companyExist) return res.send({ message: 'Company not found' });

            if (companyExist.role === 'ADMIN') return res.status(400).send({ message: 'User with ADMIN role cant update' });

            //|| companyExist.name == params.name
            if (companyExist.username == params.username || companyExist.name == params.name) {

                if (params.typeCompany != undefined || params.typeCompany != null) {
                    const existCompany = await TypeCompany.findOne({ _id: params.typeCompany });
                    if (!existCompany) return res.status(400).send({ message: 'TypeCompany not exist.' });
                }

                //Actualización de empresa
                const companyUpdate = await Company.findOneAndUpdate({ _id: companyId }, params, { new: true }).populate('typeCompany').lean();
                if (companyUpdate) return res.send({ message: 'Company updated', companyUpdate });
                else return res.send({ message: 'Company not updated' });

            }

            // || companyExist.name != params.name

            if (companyExist.username != params.username || companyExist.name != params.name) {
                //Verificación de existencia de username  
                const alreadyUsername = await Company.findOne({ username: params.username });
                if (alreadyUsername) return res.send({ message: 'Username already in use' });

                //Verificación de existencia de nombre de la empresa
                const alreadyName = await Company.findOne({ name: params.name });
                if (alreadyName) return res.send({ message: 'Name already in use' });

                if (!alreadyUsername || !alreadyName) {

                    if (params.typeCompany != undefined || params.typeCompany != null) {
                        const existCompany = await TypeCompany.findOne({ _id: params.typeCompany });
                        if (!existCompany) return res.status(400).send({ message: 'TypeCompany not exist.' });
                    }
                    //Actualización de empresa
                    const companyUpdate = await Company.findOneAndUpdate({ _id: companyId }, params, { new: true }).populate('typeCompany').lean();
                    if (companyUpdate) return res.send({ message: 'Company updated', companyUpdate });
                    else return res.send({ message: 'Company not updated' });
                }
            }
        }else return res.status(400).send({message: 'Some parameter is empty'});

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Failed to update company' });
    }
}



//ELIMINAR SU PROPIA EMPRESA//
exports.deleteCompanyIsAdmin = async (req, res) => {
    try {

        const companyId = req.params.id;

        //INGRESAR CONTRASEÑA PARA ELIMINAR//
        const params = req.body;
        const password = params.password;
        const data = {
            password: password
        }

        //Validación de Data
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);



        //Validación de contraseña para eliminación 
        const companyExist = await Company.findOne({ _id: companyId });
        if (!companyExist) return res.send({ message: 'Company not found or already deleted' });
        if (companyExist.role == 'ADMIN') return res.send({ message: 'User with ADMIN role cant update' });
        if (companyExist && await checkPassword(password, companyExist.password)) {
            //Eliminación de FACTURAS
            const billExist = await Bill.find({ company: companyId });
            for (let billDeleted of billExist) { const branchDeleted = await Bill.findOneAndDelete({ company: companyId }); }

            //Eliminación de Sucursales
            const branchExist = await Branch.find({ company: companyId });
            for (let branchDeleted of branchExist) { const branchDeleted = await Branch.findOneAndDelete({ company: companyId }); }

            //Eliminación de Clientes
            const clientExist = await Client.find({ company: companyId });
            for (let clientDeleted of clientExist) { const clientDeleted = await Client.findOneAndDelete({ company: companyId }); }

            //Eliminación de Cierres
            const closingExist = await Cierres.find({ company: companyId });
            for (let closingDeleted of closingExist) { const closingDeleted = await Cierres.findOneAndDelete({ company: companyId }); }

            //Eliminación de Inventario
            const inventoryExist = await Inventory.find({ company: companyId });
            for (let inventoryDeleted of inventoryExist) { const inventoryDeleted = await Inventory.findOneAndDelete({ company: companyId }); }

            //Eliminación de Ordenes
            const orderExist = await Order.find({ company: companyId });
            for (let orderDeleted of orderExist) { const orderDeleted = await Order.findOneAndDelete({ company: companyId }); }

            //Eliminación de Productos de la empresa
            const productExist = await Products.find({ company: companyId });
            for (let productDeleted of productExist) { const productDeleted = await Products.findOneAndDelete({ company: companyId }); }

            //Eliminación de Turnos
            const turnExisted = await Turn.find({ company: companyId });
            for (let turnDeleted of turnExisted) { const turnDeleted = await Turn.findOneAndDelete({ company: companyId }); }

            //Eliminación de Usuarios
            const userExist = await User.find({ company: companyId });
            for (let userDeleted of userExist) { const userDeleted = await User.findOneAndDelete({ company: companyId }); }

            //Eliminación de la Empresa
            const companyDeleted = await Company.findOneAndDelete({ _id: companyId }).populate('typeCompany');
            if (companyDeleted) return res.send({ message: 'Account deleted', companyDeleted });

        } else return res.status(400).send({ message: 'The password is not correct' })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting company' });
    }
}





//BUSCAR UNA EMPRESA//
exports.searchCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const getCompany = await Company.findOne({ _id: companyId });
        if (!getCompany) return res.send({ message: 'Company not found' });
        return res.send(getCompany);
    } catch (err) {
        console.log(err);
        return err;
    }
}


//MOSTRAR LAS EMPRESAS//
exports.searchCompanies = async (req, res) => {
    try {
        const getCompany = await Company.find({ role: 'COMPANY' }).populate('typeCompany');
        if (!getCompany) return res.send({ message: 'Companies not found' });
        return res.send({ message: 'Companies Found', getCompany });
    } catch (err) {
        console.log(err);
        return err;
    }
}


//BUSCAR UNA SUCURSAL//
exports.searchBranchIsAdmin = async (req, res) => {
    try {
        const branchId = req.params.id;
        const getBranch = await Branch.findOne({ _id: branchId }).populate('company township').lean();
        if (!getBranch) return res.status(400).send({ message: 'Branch Not Found' });

        getBranch.company.username = undefined;
        getBranch.company.password = undefined
        getBranch.company.email = undefined
        getBranch.company.phone = undefined
        getBranch.company.role = undefined
        getBranch.company.typeCompany = undefined
        getBranch.company.__v = undefined

        for (var key = 0; key < getBranch.products.length; key++) {

            delete getBranch.products[key].companyProduct.stock;
            delete getBranch.products[key].companyProduct.sales;
            delete getBranch.products[key].companyProduct.price;
            delete getBranch.products[key].companyProduct.company;
            delete getBranch.products[key].companyProduct._id;
            delete getBranch.products[key].companyProduct.__v;
        }
        if (!getBranch) return res.send({ message: 'Branch not found' });
        return res.send({ message: 'Branch Found:', getBranch });
    } catch (err) {
        console.log(err);
        return err;
    }
}



exports.getCompanyAdmin = async (req, res) => {
    console.log(req.user)
    try {
        //const companyID = req.params.id;
        const companyID = req.user['sub']
        const getCompany = await Company.findOne({ _id: companyID }).populate('typeCompany').lean();
        if (!getCompany) return res.send({ message: 'Company not found' });
        return res.send({ message: 'Companies Found:', getCompany });
    } catch (err) {
        console.log(err);
        return err;
    }
}

//Get BranchesIsAdmin//
exports.getBranchesByCompanyIsAdmin = async (req, res) => {
    try {
        const companyID = req.params.id;
        const getBranchesIsAdmin = await Branch.find({ company: companyID }).populate('company township');
        if (!getBranchesIsAdmin) return res.send({ message: 'Branches not found' });
        return res.send({ message: 'Branches Found', getBranchesIsAdmin });
    } catch (err) {
        console.log(err);
        return err;
    }
}

