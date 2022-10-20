'use strict';


//Importación de las Dependencias
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require ('cors');


//Importación de las Rutas//
const companyRoutes = require('../src/routes/company.routes');
const typeCompanyRoutes = require('../src/routes/typeCompany.routes');
const townshipRoutes = require('../src/routes/township.routes');
const branchRoutes = require('../src/routes/branch.routes');
const providerRoutes = require('../src/routes/provider.routes');
const warehouseRoutes = require('../src/routes/warehouse.routes');
const typePaymentRoutes = require('../src/routes/typePayment.routes');
const ofertRoutes = require('../src/routes/ofert.routes');
const categoryProductRoutes = require('../src/routes/categoryProduct.routes');
const inventoryRoutes = require('../src/routes/inventory.routes');
const prodcutRoutes = require('../src/routes/product.routes');
const clientRoutes = require('../src/routes/client.routes');
const userRoutes = require('../src/routes/user.routes');

//APP -> Servidor HTTP (Express)
const app = express(); //Creación del Servidor de Express


/*--------- CONFIGURACIÓN DEL SERVIDOR ---------*/ 

app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());


app.use('/company', companyRoutes);
app.use('/typeCompany', typeCompanyRoutes);
app.use('/township', townshipRoutes);
app.use('/branch', branchRoutes);
app.use('/provider', providerRoutes);
app.use('/warehouse', warehouseRoutes);
app.use('/typePayment', typePaymentRoutes);
app.use('/ofert', ofertRoutes);
app.use('/categoryProduct', categoryProductRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/product', prodcutRoutes); 
app.use('/client', clientRoutes);
app.use('/user', userRoutes);



//Exportación//
module.exports = app;