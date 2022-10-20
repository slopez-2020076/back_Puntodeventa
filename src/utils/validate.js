'use strict'

const bcrypt = require('bcrypt-nodejs');
const Company = require('../models/company.model');
const User = require('../models/user.model');
const fs = require('fs');

exports.validateData = (data) =>
{
    let keys = Object.keys(data), msg = '';

    for(let key of keys)
    {
        if(data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `The params ${key} is required.\n`
    }
    return msg.trim();
}

exports.alreadyCompany = async (username)=>{
   try{
    let exist = Company.findOne({username:username}).lean()
    return exist;
   }catch(err){
       return err;
   }
}


exports.alreadyUser = async (username)=>{
    try{
     let exist = User.findOne({username:username}).lean()
     return exist;
    }catch(err){
        return err;
    }
 }

exports.encrypt = async (password) => {
    try{
        return bcrypt.hashSync(password);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash)=>{
    try{
        return bcrypt.compareSync(password, hash);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPermission = async (userId, sub)=>{
    try{
        if(userId != sub){
            return false;
        }else{
            return true;
        }
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkUpdate = async (user)=>{
    if(user.password || Object.entries(user).length === 0 || user.role){
        return false;
    }else{
        return true;
    }
}

exports.checkUpdateAdmin = async (user)=>{
    if(user.password || Object.entries(user).length === 0){
        return false;
    }else{
        return true;
    }
}


exports.checkUpdated = async (user)=>{
    try{
        if(user.password || Object.entries(user).length === 0 || user.role ){
            return false;
        }else{
            return true; 
        }
    }catch(err){
        console.log(err); 
        return err; 
    }
}

//Eliminación de Datos Innecesarios Carrito de Compras//
exports.detailsShoppingCart = async(shoppingCartId)=>
{   
    const searchShoppingCart = await Reservation.findOne({_id:shoppingCartId})

    for(var key = 0; key < searchShoppingCart.products.length; key++)
    {
        delete searchShoppingCart.user.password;
        delete searchShoppingCart.user.role;
        delete searchShoppingCart.products[key].product.stock;
        delete searchShoppingCart.products[key].product.price;
        delete searchShoppingCart.products[key].product.sales;
        delete searchShoppingCart.products[key].product.category;
    }
    return searchShoppingCart;
}


//Función que Busca una Categoría por el nombre.//
exports.searchCategory = async(categoryName)=>{
    try{
        const category = Category.findOne({name: categoryName}).lean();
        return category;
    } catch(err){
        console.log(err);
        return err;
    }
}

//Función que Busca una Categoría por el ID.//
exports.searchCategoryId = async(categoryId)=>{
    try{
        const category = Category.findOne({_id: categoryId}).lean();
        return category;
    }catch(err){
        console.log(err);
        return err;
    }
}


//Eliminación de Datos Innecesarios Factura//
exports.detailsBill = async(billId)=>{   
    const searchBill = await Bill.findOne({_id:billId})
    .populate('user')
    .populate('products.product')
    .lean();

    for(var key = 0; key < searchBill.products.length; key++){
        delete searchBill.user.password;
        delete searchBill.user.role;
        delete searchBill.products[key].product.stock;
        delete searchBill.products[key].product.price;
        delete searchBill.products[key].product.sales;
        delete searchBill.products[key].product.category;
    }
    return searchBill;
}

