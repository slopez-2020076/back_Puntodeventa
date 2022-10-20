' use strict '

const Bill = require('../models/bill.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

//Importación del Modelo -User-
const User = require('../models/user.model');
const Client = require('../models/client.model');

//Importación del Reporte en PDF de la Factura//
const {savePDF} = require('./billPDF.controller');

const { detailsBill, validateData} = require('../utils/validate');
const   Client = require('../controllers/client.controller');


exports.testBill = (req, res)=>{
    return res.send({message: 'The function test is running.'});
}




//Crear||Guardar Facturas
exports.createBill = async (req, res)=>{

    try{
        const params = req.body;
        const NITclient = params.NIT;

        //Obtener el ID del cliente
        const clientID = await Client.findOne({NIT: NITclient});
        if(!clientID){
           
        return res.send({message: "Client not Found"});}
        //Guardar en caso de no encontrar el Cliente


        const payOrder = await Order.findOne({client: clientID._id}).lean();
        
        //Verificar que el Carrito tenga Productos//
        if(!payOrder || payOrder.products.length == 0) return res.send({message:'Order empty, add products.'})

        //Capturar la Fecha Actual.//
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


        //Generador de Codigos de
        const bills = await Bill.count().lean();


        const OrderBuy = {
            //Seteando la Fecha Actual.//
            date: setDateOrder,
            state: "delivered",
            numberBill: bills+1000,
            user: payOrder.user,
            NIT: payOrder.NIT,
            products: payOrder.products,
            IVA: payOrder.IVA,
            subTotal: payOrder.subTotal,
            total: payOrder.total
        }

        //Guardar la Factura.//
        const bill = new Bill(OrderBuy);
        await bill.save();
        
        const viewBill = await Bill.findOne({_id: bill._id});

        //Imprimir en PDF la Factura//
        const pdf = await savePDF(viewBill);
        const reViewBill = await detailsBill(viewBill);
        return res.send({message:'Bill Generated Succesfully.', reViewBill});     
    }catch(err){
        console.log(err);
        return err;
    }
}





//Visualizar Facturas por Usuario.//
exports.getBillsUser = async(req,res)=>{
    try{
        const userId = req.params.id;

        const userExist = await User.findOne($and[{_id:userId}, {company: req.user.sub} ]);
        if(!userExist) return res.send({message:'User not Found.'})

        const userBills = await Bill.find({user: userId});
        if(userBills.length === 0)  return res.send({message:'User does not have bills.'});

        return res.send({message:'Bills Found', user: userExist.username, userBills});
    }catch(err) {
        console.log(err);
        return err;
    }
}



//Visualizar Facturas por Cliente.//
exports.getBillsClient = async(req,res)=>{
    try{
        const clientID = req.params.id;

        const clientExist = await Client.findOne({_id: clientID});
        if(!clientExist) return res.send({message:'User not Found.'});

        const clientBills = await Bill.find({NIT: clientExist.NIT});
        if(clientBills.length === 0) return res.send({message:'Client does not have bills.'});

        return res.send({message:'Bills Found', Client: clientExist.name, userBills});
    }catch(err){
        console.log(err);
        return err;
    }
}






//Visualizar los Productos de una Factura.//
exports.getProductsBill = async(req,res)=>{
    try{
        const billId = req.params.id;

        const billExist = await Bill.findOne({_id:billId}).lean();
        if(!billExist) return res.send({message:'Bill not found.'});
        
        const searchBill = await Bill.findOne({_id: billId});
        const productBills = searchBill.products;
        return res.send({message:'Bill Found',productBills});
    
    }catch(err){
        console.log(err);
        return err;
    }
}



