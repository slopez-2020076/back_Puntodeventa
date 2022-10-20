'use strict'

const Ofert = require('../models/ofert.model');
const { validateData, checkUpdated } = require('../utils/validate');


//Función de Testeo//
exports.testOfert = (req, res) => {
    return res.send({ message: 'Function testProvider is running' });
}




//Agregar Oferta//
exports.saveOfert = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name,
            discount: params.discount,
            company: req.user.sub

        };

        //Validación de Data
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Validación de que la oferta no sea mayor a 100
        if (data.discount > 100) return res.send({ message: "The value of the discount cannot exceed 100%." })


        //Validación de que la oferta no sea menor a 0
        if (data.discount < 0) return res.send({ message: "The value of the discount cannot 0." });

        //Verificación de existencia de Oferta
        const ofertExist = await Ofert.findOne({ $and: [{ name: params.name }, { company: data.company }] });
        if (!ofertExist) {
            const ofert = new Ofert(data);
            await ofert.save();
            return res.send({ message: 'Ofert saved', ofert });
        } else return res.status(400).send({ message: 'Ofert already exist' });

    } catch (err) {
        console.log(err);
        return err;
    }
}



//Mostrar todos las Ofertas//
exports.getOferts = async (req, res) => {
    try {
        const oferts = await Ofert.find();
        if (!oferts) return res.send({ message: "Oferts not found." })
        return res.send({ message: 'Oferts:', oferts })
    } catch (err) {
        console.log(err);
        return err;
    }
}


//Mostrar una Oferta//
exports.getOfert = async (req, res) => {
    try {
        const ofertID = req.params.id
        const ofert = await Ofert.findOne({ _id: ofertID });
        if (!ofert) return res.send({ message: "Ofert not found." })
        return res.send({ message: 'Ofert:', ofert })
    } catch (err) {
        console.log(err);
        return err;
    }
}


//Actualizar una Oferta //
exports.updateOfert = async (req, res) => {
    try {
        const params = req.body;
        const ofertID = req.params.id;

        const check = await checkUpdated(params);
        if (check === false) return res.status(400).send({ message: 'Data not recived' });

        const msg = validateData(params);
        if (!msg) {
            //Verificación de Existencia de Oferta
            const ofertExist = await Ofert.findOne({ _id: ofertID });
            if (!ofertExist) return res.status.send({ message: 'Ofert not found' });

            if (ofertExist.name == params.name) {

                //Validación de que la oferta no sea mayor a 100
                if (params.discount > 100) return res.send({ message: "The value of the discount cannot exceed 100%." })

                //Validación de que la oferta no sea menor a 0
                if (params.discount < 0) return res.send({ message: "The value of the discount cannot 0." });

                //Update Oferta
                const updateOfert = await Ofert.findOneAndUpdate({ _id: ofertID }, params, { new: true });
                return res.send({ message: 'Update Ofert', updateOfert });
            }

            if (ofertExist.name != params.name) {
                //Verificación de existencia de nombre de la Oferta
                const alreadyName = await Ofert.findOne({$and:[{ name: params.name }, { company: ofertExist.company }]});
                if (alreadyName) return res.status(400).send({ message: 'Name Ofert Already Exist' });

                if(!alreadyName){
                    //Validación de que la oferta no sea mayor a 100
                    if (params.discount > 100) return res.send({ message: "The value of the discount cannot exceed 100%." })

                    //Validación de que la oferta no sea menor a 0
                    if (params.discount < 0) return res.send({ message: "The value of the discount cannot 0." });

                    //Update Oferta
                    const updateOfert = await Ofert.findOneAndUpdate({ _id: ofertID }, params, { new: true });
                    return res.send({ message: 'Update Ofert', updateOfert });
                }
            }

        } else return res.status(400).send({ message: 'Some parameter is empty' })

    } catch (err) {
        console.log(err);
        return err;
    }
}




//Eliminar una Oferta //
exports.deleteOfert = async (req, res) => {
    try {
        const ofertID = req.params.id;

        //Verificar la existencia de la Oferta
        const ofertExist = await Ofert.findOne({ _id: ofertID });
        if (!ofertExist) return res.status(400).send({ message: 'Ofert not found or already deleted.' });

        //Eliminación de la Oferta
        const ofertDeleted = await Ofert.findOneAndDelete({ _id: ofertID });
        return res.send({ message: 'Delete Ofert.', ofertDeleted });

    } catch (err) {
        console.log(err);
        return err;
    }
}
