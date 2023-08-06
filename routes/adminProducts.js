const express = require('express');
const mongoose = require('mongoose')
const admin = require('../models/adminSchema')
const productsCollection = require('../models/productsSchema')
const categories = require('../models/categorySchema')
const multer = require("multer")


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("hello", file)
        // Specify the directory where uploaded files should be stored.
        cb(null, './images');
    },
    filename: function (req, file, cb) {
        // Specify how the filename should be generated (optional).
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


const router = express.Router();
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: 'dshijvj8y',
    api_key: '372666973892567',
    api_secret: 'aFnFFLvZ9qu_F504nN_DeyHH3ls'
});







/* GET home page. */
router.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.search
        const editPrd = req.query.editPrd
        let productsList = await productsCollection.find()
        let categoriesList = await categories.find()
        if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, 'i');
            productsList = productsList.filter(product => searchRegex.test(product.prd_name))
        }

        res.render('adminProducts', { productsList, categoriesList })
    } catch (error) {
        console.log(error.message);
    }
});
router.patch('/active/:id', async (req, res) => {
    try {
        const prd = req.params.id
        await productsCollection.updateOne({ _id: prd }, { $set: { active: true } })
        res.send(200)
    } catch (error) {
        console.log(error.message);
    }
})
router.patch('/deactive/:id', async (req, res) => {
    try {
        const prd = req.params.id
        await productsCollection.updateOne({ _id: prd }, { $set: { active: false } })
        res.send(200)
    } catch (error) {
        console.log(error.message);
    }
})

router.patch('/deactiveCategory/:id', async (req, res) => {
    try {
        const cat = req.params.id
        await categories.updateOne({ _id: cat }, { $set: { active: false } })
        res.send(200)
    } catch (error) {
        console.log(error.message);
    }
})
router.patch('/activeCategory/:id', async (req, res) => {
    try {
        const cat = req.params.id
        await categories.updateOne({ _id: cat }, { $set: { active: true } })
        res.send(200)
    } catch (error) {
        console.log(error.message);
    }
})

router.post('/update-prd', async (req, res) => {
    try {
        console.log(req.body);
        const prd = req.body

        if (prd.prd_id&&prd.prd_name) {
            if(prd.prd_images.length){
                await productsCollection.updateOne({ _id: prd.prd_id }, {
                    prd_name: prd.prd_name,
                    description: prd.prd_desc,
                    additional_info: prd.prd_addinfo,
                    category: prd.prd_category,
                    discount: prd.prd_discount,
                    mrp: prd.prd_mrp,
                    stock: prd.prd_stock,
                    purchase: prd.prd_purchase,
                    prd_images: prd.prd_images
                }, { upsert: true })
            }else{
                await productsCollection.updateOne({ _id: prd.prd_id }, {
                    prd_name: prd.prd_name,
                    description: prd.prd_desc,
                    additional_info: prd.prd_addinfo,
                    category: prd.prd_category,
                    discount: prd.prd_discount,
                    mrp: prd.prd_mrp,
                    stock: prd.prd_stock,
                    purchase: prd.prd_purchase
                }, { upsert: true })
            }
            return res.redirect('/admin/products-management')
        }
        if(prd.prd_name){
            await productsCollection.create({
                prd_name: prd.prd_name,
                description: prd.prd_desc,
                additional_info: prd.prd_addinfo,
                category: prd.prd_category,
                discount: prd.prd_discount,
                mrp: prd.prd_mrp,
                stock: prd.prd_stock,
                purchase: prd.prd_purchase,
                prd_images: prd.prd_images
            })
            res.redirect('/admin/products-management')
        }


    } catch (error) {
        console.log(error.message);
    }
})
router.post('/updateCategory', async (req, res) => {
    try {
        const cat = req.body
        if (cat.cat_id) {
            await categories.updateOne({ _id: cat.cat_id }, {
                name: cat.cat_name,
            }, { upsert: true })
            return res.redirect('/admin/products-management')
        }
        await categories.create({
            name: cat.cat_name
        })
        res.redirect('/admin/products-management')


    } catch (error) {
        console.log(error.message);
    }
})


router.post("/uploadImage", upload.single("file"), async (req, res) => {
    let resul
    console.log(req)
    await cloudinary.v2.uploader.upload(`./images/${req.file.originalname}`,
        { public_id: req.file.originalname },
        function (error, result) { resul = result });



    res.json(resul.secure_url)

})




module.exports = router;
