'use strict';


//Importación de los Modelos -Productos-
const PaymentBox = require('../models/paymentBox.model');

//Importación del Modelo -Orden-
const Branch = require('../models/branch.model');
const PaymentBox = require('../models/paymentBox.model');
const Cierre = require('../models/cierre.model');


//Importación del Reporte en PDF de la Factura//
const {saveRetiroPDF, savePagosVariosPDF} = require('./billPDF.controller');

const { validateData } = require('../utils/validate');


//Función de testeo de PaymentBox //
exports.testPaymentBox = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}


//Función para crear una caja//
exports.saveBox = async (req, res) => {
    try {
        const user = req.user.sub;
        const params = req.body;

        const data = {
            nameBox: params.nameBox,
            EstadoCaja: "CERRADA",

            No_Aligeramientos: 0,
            Fondo: 0,
            Efectivo: 0,
            Tarjeta: 0,
            Cheques: 0,
            AligeramientoVentas: 0,
            PagosVarios: 0,
            RetirosVueltos: 0,
            EnCaja: 0,

            TotalVisa: 0,
            TotalCredomatic: 0,
            TotalTajetas: 0,

            Dolares: 0,
            VueltosQuetzales: 0,

            TotalVentas: 0,
            TotalImpuestos: 0,
            TotalDescuentos: 0,
            TotalPropinas: 0,
            TotalCreditos: 0,
            Retiros: 0,
            CantidadFacturas: 0,
            CantidadRecibos: 0,
            InicioCaja: 0,
            FinalCierre: 0,

            user: req.user.sub,
            branch: params.branch,

        };

        //Verificación de la existencia de la sucursal
        const branchExist = await Branch.findOne({ _id: params.branch });
        if (!branchExist) return res.send({ message: "Sucursal no encontrada." });

        //Verificación de existencia de nombre de la Caja
        const alreadyName = await PaymentBox.findOne($and[{ nameBox: params.nameBox }, { branch: branchExist }]);
        if (alreadyName && providerExist.name != params.name) return res.status(400).send({ message: 'El nombre de la caja ya ha sido utilizado.' });

        //Creación de la Caja
        const addBox = PaymentBox(checkdata);
        await addBox.save();

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando la Caja.' });
    }
}




//ACTUALIZAR UNA CAJA //
exports.updateBox = async (req, res) => {
    try {
        const boxID = req.params.id;
        const params = req.body;

        const data = {
            nameBox: params.nameBox,
            branch: params.branch,
        };

        //Verificación de existencia de la Caja//
        const boxExist = await PaymentBox.findOne({ _id: boxID });
        if (!boxExist) return res.send({ message: 'Caja no encontrada.' });

        //Verificación de la existencia de la sucursal//
        const branchExist = await Branch.findOne({ _id: params.branch });
        if (!branchExist) return res.send({ message: "Sucursal no encontrada." });

        //Verificación de existencia de nombre de la Caja//
        const alreadyName = await PaymentBox.findOne($and[{ nameBox: params.nameBox }, { branch: branchExist }]);
        if (alreadyName && providerExist.name != params.name) return res.status(400).send({ message: 'El nombre de esa caja ya ha sido utilizado.' });


        //Actualización de la caja
        if (boxExist.EstadoCaja == "CERRADA") {
            const updateBox = await PaymentBox.findOneAndUpdate({ _id: boxID }, data, { new: true });
            if (updateBox) return res.send({ message: 'Caja Actualilzada:', updateBox });
            return res.send({ message: 'Caja no Actualizada.' });
        } else {
            return es.send({ message: "Debe de cambiar el estado de la caja para poder actualizar." })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error actualizando la Caja.' });
    }
}





//Funcion para agregar un Fondo a la Caja //
exports.addFondo = async (req, res) => {
    try {
        const boxID = req.params.id;
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


        const data = {
            username: params.username,
            password: params.password
        };

        //Validación de Data necesaria//
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {

            data.Fondo = params.fondo;

            //Verificar que exista el la Caja//
            const boxExist = await PaymentBox.findOne({ _id: boxID });
            if (!boxExist) return res.send({ message: 'Caja no encontrada.' })

            //Validación que sea mayor a 0
            if (data.Fondo < 0) return res.status(400).send({ message: 'La cantidad a ingresar debe ser mayor a 0.' })

            //Update  Total, en caja
            const total = boxExist.total + data.Fondo;
            const updateEnCaja = boxExist.EnCaja + data.Fondo;

            const newFondo = await PaymentBox.findOneAndUpdate({ _id: boxExist._id },
                {
                    Total: total,
                    EnCaja: updateEnCaja
                },
                { new: true });

            return res.send({ message: 'Agregando fondos a la Caja:.', newFondo });
        } else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error agregando fondos a la caja.' });
    }
}





//Funcion para Aligerar Ventas de la Caja //
exports.AligerarVentas = async (req, res) => {
    try {
        const boxID = req.params.id;
        const params = req.body;
        const data = {
            username: params.username,
            password: params.password
        };

        //Validación de la Data Necesaria//
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {

            data.Aligerar = params.Aligerar;

            //Verificar que exista el la Caja//
            const boxExist = await PaymentBox.findOne({ _id: boxID });
            if (!boxExist) return res.send({ message: 'Caja no encontrada.' })

            //Validación que sea mayor a 0
            if (data.Aligerar < 0) return res.status(400).send({ message: 'La cantidad debe ser mayor a0 0' });
            if (data.Aligerar > boxExist.EnCaja) return res.status(400).send({ message: 'La cantidad no debe soberpasar la cantidad existente.' })

            //Update En Caja
            const updateEnCaja = boxExist.EnCaja - data.Aligerar;
            const update = boxExist.Retiros + data.Aligerar;

            const newFondo = await PaymentBox.findOneAndUpdate({ _id: boxExist._id },
                { EnCaja: updateEnCaja, AligerarVentas: update },
                { new: true });

            return res.send({ message: 'Aligeramiento realizado.', newFondo });

        } else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando aligeramiento Ventas.' });
    }
}




//Funcion para los Pagos Varios de la Caja //
exports.pagosVarios = async (req, res) => {
    try {
        const boxID = req.params.id;
        const params = req.body;
        const data = {
            username: params.username,
            password: params.password
        };


        //Validación de data necesaria //
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {

            data.pagosVarios = params.pagosVarios;

            //Verificar que exista el la Caja//
            const boxExist = await PaymentBox.findOne({ _id: boxID });
            if (!boxExist) return res.send({ message: 'Caja no encontrada.' })

            //Validación que sea mayor a 0
            if (data.Aligerar < 0) return res.status(400).send({ message: 'La cantidad debe ser mayor a 0.' });
            if (data.Aligerar > boxExist.EnCaja) return res.status(400).send({ message: 'La cantidad no debe soberpasar la cantidad existente.' })

            //Update En Caja
            const updateEnCaja = boxExist.EnCaja - data.pagosVarios;
            const update = boxExist.Retiros + data.pagosVarios;
            const userName = await User.findOne({_id: boxExist.user})
            viewPagosVarios = {
                DateNow: boxExist.FechaApertura,
                user: userName.name,
                branch: boxExist.branch,
                Encaja: boxExist.Encaja,
                pagosVarios: data.pagosVarios,
                Total: updateEnCaja,
                Autorization: gerenteExist.name
            }

            const newFondo = await PaymentBox.findOneAndUpdate({ _id: boxExist._id },
                { EnCaja: updateEnCaja, PagosVarios: update },
                { new: true });

            const pdf = await savePagosVariosPDF(viewPagosVarios);
            return res.send({ message: 'Pagos Varios realizado.', newFondo });
        } else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando Pagos Varios.' });
    }
}



//Funcion para Arqueo de la Caja //
exports.ArqueoCaja = async (req, res) => {
    try {
        const boxID = req.params.id;
        const parmas = req.body;

        const data = {
            username: params.username,
            password: params.password
        }

        //Funcion de Validación de Data necesario//
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el la Caja//
        const boxExist = await PaymentBox.findOne({ _id: boxID });
        if (!boxExist) return res.send({ message: 'Caja no encontrada.' })

        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {

            const arqueo = await PaymentBox.findOne({ _id: boxID });
            return res.send({ message: 'Arqueo Realizado ', arqueo });

        } else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando Arqueo de Caja.' });
    }
}




//Funcion para hacer un retiro de Fondo a la Caja //
exports.retiroFondo = async (req, res) => {
    try {
        const boxID = req.params.id;
        const params = req.body;
        const data = {
            username: params.username,
            password: params.password
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {
            data.Fondo = params.montoFondo;

            //Verificar que exista el la Caja//
            const boxExist = await PaymentBox.findOne({ _id: boxID });
            if (!boxExist) return res.send({ message: 'Caja no existe.' });


            //Validación que sea mayor a 0
            if (data.Fondo < 0) return res.status(400).send({ message: 'La cantidad debe ser mayor a 0.' });
            if (data.Fondo > boxExist.Fondo) return res.status(400).send({ message: 'La cantidad no debe ser mayor a la cantidad existente' });

            //Update  Total, en caja
            const total = boxExist.total - data.Fondo;
            const updateEnCaja = boxExist.EnCaja - data.Fondo;
            const userBox = await User.findOne({ _id: boxExist._id });


            const newFondo = await PaymentBox.findOneAndUpdate({ _id: boxExist._id },
                {
                    Total: total,
                    EnCaja: updateEnCaja
                },
                { new: true });


            viewRetiro = {
                DateNow: boxExist.FechaApertura,
                user: userBox.name,
                branch: boxExist.branch,
                Encaja: boxExist.Encaja,
                retiro: data.Fondo,
                Total: updateEnCaja,
                Autorization: gerenteExist.name
            }

            const pdf = await saveRetiroPDF(viewRetiro);
            return res.send({ message: 'Retiro de Fondo:', newFondo });
        }
        else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error retirando Fondo.' });
    }
}



//Mostrar todos las Cajas//
exports.getBoxes = async (req, res) => {
    try {
        const boxes = await PaymentBox.find();
        return res.send({ message: 'Cajas:', boxes })
    } catch (err) {
        console.log(err);
        return err;
    }
}

4

//Mostrar todos las Cajas Abiertas//
exports.getBoxes = async (req, res) => {
    try {
        const boxes = await PaymentBox.find({ EstadoCaja: "ABIERTA" });
        return res.send({ message: 'Cajas:', boxes })
    } catch (err) {
        console.log(err);
        return err;
    }
}


//Mostrar todos las Cajas Cerradas//
exports.getBoxes = async (req, res) => {
    try {
        const boxes = await PaymentBox.find({ EstadoCaja: "CERRADA" });
        return res.send({ message: 'Cajas:', boxes })
    } catch (err) {
        console.log(err);
        return err;
    }
}




//Eliminar una Caja  //
exports.deleteBox = async (req, res) => {
    try {
        const boxID = req.params.id;

        //Verificación de existencia de la Caja 
        const boxExist = await PaymentBox.findOne({ _id: boxID });
        if (!boxExist) return res.status(400).send({ message: 'Caja no encontrada o ya ha sido eliminadda.' });

        //Validación del estado de la Orden
        if (boxExist.EstadoCaja == "CERRADA") {
            //Eliminación de la orden
            const boxDeleted = await PaymentBox.findOneAndDelete({ _id: boxID });
            return res.send({ message: 'Caja Eliminada:', boxDeleted });

        } else { return res.send({ message: 'Debe cambiar el estado de la Caja.' }); }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error elimando la Caja.' });

    }
}





//Función para cerrar una caja//
exports.cierreCaja = async (req, res) => {
    try {
        const boxID = req.params.id;
        const params = req.body;

        const DataPermis = {
            username: params.username,
            password: params.password
        }

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



        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {

            const data = {
                EstadoCaja: "CERRADA",
                No_Aligeramientos: 0,
                Fondo: 0,
                Efectivo: 0,
                Tarjeta: 0,
                Cheques: 0,
                AligeramientoVentas: 0,
                PagosVarios: 0,
                RetirosVueltos: 0,
                EnCaja: 0,
                TotalVisa: 0,
                TotalCredomatic: 0,
                TotalTajetas: 0,
                Dolares: 0,
                VueltosQuetzales: 0,
                TotalVentas: 0,
                TotalImpuestos: 0,
                TotalDescuentos: 0,
                TotalPropinas: 0,
                TotalCreditos: 0,
                Retiros: 0,
                CantidadFacturas: 0,
                CantidadRecibos: 0,
                InicioCaja: 0,
                FinalCierre: 0,
                Pagos: []
            };

            //Verificación de existencia de la Caja
            const boxExist = await PaymentBox.findOne({ _id: boxID });
            if (!boxExist) return res.status(400).send({ message: 'Caja no encontrada.' });


            //Seteo de la data del a Caja
            const viewCierreDelDia = {
                FechaApertura: boxExist.FechaDeApertura,
                FechaCierre: setDateOrder,
                No_Aligeramientos: boxExist.No_Aligeramientos,
                Fondo: boxExist.Fondo,
                Efectivo: boxExist.Efectivo,
                Tarjeta: boxExist.Tarjeta,
                Cheques: boxExist.Cheques,
                AligeramientoVentas: boxExist.AligeramientoVentas,
                PagosVarios: boxExist.pagosVarios,
                RetirosVueltos: boxExist.RetirosVueltos,
                EnCaja: boxExist.EnCaja,

                TotalVisa: boxExist.TotalVisa,
                TotalCredomatic: boxExist.TotalCredomatic,
                TotalTajetas: boxExist.TotalTajetas,

                Dolares: boxExist.Dolares,
                VueltosQuetzales: boxExist.VueltosQuetzales,

                TotalVentas: boxExist.TotalVentas,
                TotalImpuestos: boxExist.TotalImpuestos,
                TotalDescuentos: boxExist.TotalDescuentos,
                TotalPropinas: boxExist.TotalPropinas,
                TotalCreditos: boxExist.TotalCreditos,
                Retiros: boxExist.Retiros,
                CantidadFacturas: boxExist.CantidadFacturas,
                CantidadRecibos: boxExist.CantidadRecibos,
                InicioCaja: boxExist.InicioCaja,
                FinalCierre: boxExist.FinalCierre,
                pagos: boxExist.Pagos,
                user: boxExist.user,
                branch: boxExist.branch
                
            }

            //Datos de generación de Comprobante//


            //Verificación de existencia del Cierre General
            const CierreGeneralExist = await Cierre.findOne($and[{ FechaDelCierreGeneral: setDateOrder }, { Caja: boxExist }]);

            if (boxExist.EstadoCaja == "ABIERTO" && CierreGeneralExist.EstadoDelDia == "ABIERTO") {

                const newOrder = await Cierre.findOneAndUpdate({ _id: CierreGeneralExist._id },
                    { $push: { CierresDelDia: viewCierreDelDia } },
                    { new: true });

                //Seteo de la caja//
                const cierreUpdate = await PaymentBox.findOneAndUpdate({ _id: boxID }, data, { new: true });
                if (cierreUpdate) return res.send({ message: 'Caja Cerrada:', cierreUpdate });
                return res.send({ message: 'Cierre de Caja no realizado' });


            } else return res.send({ message: "El estado de la caja Actualmente es -CERRADO-." });

        } else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error cerrando la Caja.' });
    }
}





//Función para Abrir una Caja//
exports.AperturaCaja = async (req, res) => {
    try {
        const boxID = req.params.id;
        const params = req.body;

        const dataPermiss = {
            username: params.username,
            password: params.password
        }

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


        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {

            const viewAperturaCaja = {
                EstadoCaja: "ABIERTO",
                FechaApertura: setDateOrder,
                No_Aligeramientos: 0,
                Fondo: 0,
                Efectivo: 0,
                Tarjeta: 0,
                Cheques: 0,
                AligeramientoVentas: 0,
                PagosVarios: 0,
                RetirosVueltos: 0,
                EnCaja: 0,
                TotalVisa: 0,
                TotalCredomatic: 0,
                TotalTajetas: 0,
                Dolares: 0,
                VueltosQuetzales: 0,
                TotalVentas: 0,
                TotalImpuestos: 0,
                TotalDescuentos: 0,
                TotalPropinas: 0,
                TotalCreditos: 0,
                Retiros: 0,
                CantidadFacturas: 0,
                CantidadRecibos: 0,
                InicioCaja: 0,
                FinalCierre: 0,
                Pagos: []
            };

            //Verificación de existencia de la Caja//
            const boxExist = await PaymentBox.findOne({ _id: boxID });
            if (!boxExist) return res.status(400).send({ message: 'Caja not Exist' });

            //Verificación de existencia de la Sucursal
            const branch = await Branch.findOne({ _id: boxExist.branch });
            if (!branch) return res.send({ message: "Branch not found" });


            //Verificación de existencia del Cierre General
            const CierreGeneralExist = await Cierre.findOne($and[{ FechaDelCierreGeneral: setDateOrder }, { Caja: boxExist }]);
            if (!CierreGeneralExist) {

                const dataCierreGeneral = {
                    EstadoDelDia: "ABIERTO",
                    FechaDeApertura: setDateOrder,
                    FechaDelCierre: "",
                    HoraCierreGeneral: "",
                    Caja: boxExist._id,
                    branch: branch._id,
                    CierresDelDia: [],
                };

                //Creación de la Caja
                const addCierre = Cierre(dataCierreGeneral);
                await addCierre.save();

            }

            if (boxExist.EstadoCaja == "CERRADO" && CierreGeneralExist.EstadoDelDia == "ABIERTO") {
                //Apertura de la caja//
                const aperturaCaja = await PaymentBox.findOneAndUpdate({ _id: boxID }, viewAperturaCaja, { new: true });
                if (aperturaCaja) return res.send({ message: 'Caja Abierta', aperturaCaja });
                else return res.send({ message: 'Apertura de Caja no realizado.' });
            } else {
                return res.send({ message: "El estado actualmente es Abierto." })
            }

        } else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error abriendo la Caja.' });
    }
}




//Función para cerrar una caja General//
exports.cierreCajaGeneral = async (req, res) => {
    try {
        const cierreID = req.params.id;
        const params = req.body;

        const dataPermiss = {
            username: params.username,
            password: params.password
        }

        const date = new Date();
        const dateLocal = (date).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitDate = dateLocal.split(' ');
        const splitDateOne = splitDate[0].split('/');
        if (splitDateOne[0] < 10) {
            splitDateOne[0] = '0' + splitDateOne[0];
        }
        if (splitDateOne[1] < 10) {
            splitDateOne[1] = '0' + splitDateOne[1];
        }7
        const setDate = splitDateOne[2] + '-' + splitDateOne[1] + '-' + splitDateOne[0];
        const setDateOrder = new Date(setDate);



        //Verificacion de la contraseña de un gerente//
        const gerenteExist = await User.findOne({ username: data.username });
        if (gerenteExist.role == "GERENTE" && await checkPassword(password, gerenteExist.password)) {

            const data = {
                EstadoDelDia: "CERRADA",
                FechaDelCierreGeneral: setDateOrder,
                HoraCierreGeneral: setDateOrder,
            };

            //Verificación de existencia del Cierre
            const cierreExist = await Cierre.findOne({ _id: cierreID });
            if (!cierreExist) return res.status(400).send({ message: 'Cierre no encontrada.' });


            //Verificación de existencia de la Caja
            const boxExist = await PaymentBox.findOne({ _id: cierreExist.Caja });
            if (!boxExist) return res.status(400).send({ message: 'Caja no encontrada.' });

            if (cierreExist.EstadoDelDia == "ABIERTO" && boxExist.EstadoCaja == "CERRADA") {


                const newOrder = await Cierre.findOneAndUpdate({ _id: cierreExist._id },
                    { EstadoDelDia: data.EstadoDelDia, FechaDelCierreGeneral: data.FechaDelCierreGeneral, HoraCierreGeneral: data.HoraCierreGeneral },
                    { new: true });

            } else return res.send({ message: "El estado de la Cierre General Actualmente es -CERRADO-." });

        } else {
            return res.status(400).send({ message: 'Las credenciales ingresadas no tiene los permisos requeridos, o valores ingresados incorrectos.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando el cierre.' });
    }
}
