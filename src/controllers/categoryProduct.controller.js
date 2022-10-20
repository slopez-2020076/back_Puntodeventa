'use strict';

//Importación del Modelo -Producto-
const Product = require('../models/product.model');

//Importación del Modelo -Categoria-
const Category = require('../models/categoryProduct.model');
const {validateData} = require('../utils/validate');


/*Función de Testeo*/
exports.testCategory = (req, res) =>{
    return res.send({message: 'The function test is running.'});
}


//F U N C I O N E S     P R I V A D A S//
//Agregar Categoría//
exports.addCategory = async (req, res)=>{
    try{
        const params = req.body;
        const data ={
            name: params.name,
            description: params.description
        };

        //Validación de Data
        const msg = validateData(data);
        if(msg)return res.status(400).send(msg);

        //Verificación de Existencia de Categoria
        const categoryExist = await Category.findOne({name: data.name});
        if(categoryExist)return res.send({message: 'Category is already added.'});

       //Agregando un a Categoria
        const category = new Category(data);
        await category.save();
        if(!category) return res.send({message: "Category not found"})
        return res.send({message: 'Category added Succesfully.', category});
    }
    catch(err){
        console.log(err);
        return err;
    }
}



//Visualizar todas las Categorias//
exports.getCategories = async(req,res)=>{
    try{
        const categories = await Category.find();
        if(categories.length===0) return res.send({message:'Categories not exist.'})
        return res.send({categories});
    }
    catch(err){
        console.log(err);
        return err;
    }
}



//Visualizar todas las Categorias//
exports.getCategory = async(req,res)=>{
    try{
        const categories = await Category.find();
        if(!categories) return res.send({message:'Category not exist.'})
        return res.send({categories});
    }
    catch(err){
        console.log(err);
        return err;
    }
}



//Ver Categorias por NAME//
exports.categoriesByName = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name
        };

        //Validar que llegue el Nombre del Producto//
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);


        //- Verificar que Exista la Categoría.//
        const category = await Category.findOne({ name: { $regex: params.name, $options: 'i' } }).lean();
        if (!category) return res.status(500).send({ message: 'Category not found.' });
        return res.send({message: 'Found Categories:', category });

    } catch (err) {
        console.log(err);
        return err;
    }
}




//ACTUALIZAR || Actualizar Categoria
exports.updateCategory = async(req, res)=>{
    try{
        const params = req.body;
        const categoryId = req.params.id;

        //Validación de Data
        const msg = validateData(params);
        if(msg) return res.status(400).send(msg);

        //- Verificar que Exista la Categoría.//
        const categoryExist = await Category.findOne({_id: categoryId})
        if(!categoryExist) return res.status(500).send({message: 'Category not found.'});
   

        //- Verificar que la Categoria DEFAULT se conserve.//
        if(categoryExist.name === 'DEFAULT') return res.send({message: 'Default category cannot be updated.'});

        if(categoryExist.name == params.name){
            //- Actualizar a la Categoria.//
            const categoryUpdated = await Category.findOneAndUpdate({ _id: categoryId }, params, { new: true });
            if(!categoryUpdated) return res.send({message: "Category not updated."})
            return res.send({ message: 'Category Updated.', categoryUpdated });
        }


        if (categoryExist.name != params.name ){
            const categoryAlready = await Category.findOne({ name: params.name });
            if (categoryAlready ) return res.send({ message: 'Name Category is already exist.' });

            //- Actualizar a la Categoria.//
            if(!categoryAlready){
                const categoryUpdated = await Category.findOneAndUpdate({ _id: categoryId }, params, { new: true });
                if(!categoryUpdated) return res.send({message: "Category not updated."})
                return res.send({ message: 'Category Updated.', categoryUpdated });
            }
        }
    }
    catch(err){
        console.log(err);
        return err;
    }
}





//DELETE || Eliminar Categoría
exports.deleteCategory = async(req, res)=>{
    try{
       
        //-Capturar el ID de la Categoría a Eliminar.//
        const categoryId = req.params.id;

        //- Verificar que Exista la Categoría.//
        const categoryExist = await Category.findOne({_id: categoryId})
        if(!categoryExist) return res.status(500).send({message: 'Category not found or already delete.'});

        //- Verificar que la Categoria DEFAULT se conserve.//
        if(categoryExist.name === 'DEFAULT') return res.send({message: 'Default category cannot be deleted.'});

        //- Capturar la Variable DEFAULT
        const newCategory = await Category.findOne({name:'DEFAULT'}).lean();

        //- Buscar todos los Productos con esa CATEGORIA.
        const products = await Product.find({category:categoryId});

        if(products == undefined){ }
        for(let arreglo of products){
            const updateNewCategory = await Product.findOneAndUpdate({_id:arreglo._id},{category:newCategory._id});
        }
        
        //-Eliminar la Categoría.//
        const categoryDeleted = await Category.findOneAndDelete({_id: categoryId});
        return res.send({message: 'Delete Category.', categoryDeleted});
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}


