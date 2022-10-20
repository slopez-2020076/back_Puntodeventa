'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'SecretKeyToExample';
//NewJsonWebTokenSecret2022
exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La petición no contiene la cabecera de autenticación'});
    }else{
        try{

            var token = req.headers.authorization.replace(/['"]+/g, '');
           // console.log(jwt.verify(String(token), secretKey));
            var payload = jwt.decode(token, secretKey);

            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'token expirado'});
            }
        }catch(err)
        {
            console.log(err);
            return res.status(404).send({message: 'El token no es valido'});
        }
        req.user = payload;
        next();
    }
}

exports.isAdmin = async (req, res, next)=>{
    try{
        const user = req.user;
        if(user.role === 'ADMIN') return next();
        else return res.status(403).send({message: 'User unauthorized'});
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.isAdminCompany = async (req, res, next)=>{
    try{
        const user = req.user;
        if(user.role === 'COMPANY') return next();
        else return res.status(403).send({message: 'User unauthorized'});
    }catch(err){
        console.log(err);
        return err;
    }
}


exports.isUser = async (req, res, next)=>{
    try{
        const user = req.user;
        if(user.role === 'USUARIO') return next();
        else return res.status(403).send({message: 'User unauthorized'});
    }catch(err){
        console.log(err);
        return err;
    }
}


exports.isGerent = async (req, res, next)=>{
    try{
        const user = req.user;
        if(user.role === 'GERENTE') return next();
        else return res.status(403).send({message: 'User unauthorized'});
    }catch(err){
        console.log(err);
        return err;
    }
}


exports.isClient = async (req, res, next)=>{
    try{
        const user = req.user;
        if(user.role === 'CLIENT') return next();
        else return res.status(403).send({message: 'User unauthorized'});
    }catch(err){
        console.log(err);
        return err;
    }
}



