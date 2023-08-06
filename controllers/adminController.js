const mongoose = require('mongoose')
const admin = require('../models/adminSchema')
const usersCollection = require('../models/usersSchema')
const productsCollection = require('../models/productsSchema')
const categories = require('../models/categorySchema')
const cloudinary = require('cloudinary').v2;

module.exports = {
    loadSignIn: (req, res) => {
        res.render('adminSignin')
    },
    loadDashboard: (req, res) => {
        res.render('dashboard')
    },
    loadUsersManagement: async (req, res) => {

        try {
            const searchQuery = req.query.search
            let usersList = await usersCollection.find()
            if (searchQuery) {
                const searchRegex = new RegExp(searchQuery, 'i');
                usersList = usersList.filter(user => searchRegex.test(user.first_name))
            }
            res.render('adminUsers', { usersList })
        } catch (error) {
            console.log(error.message);
        }
    },
    blockUser: async (req, res) => {
        try {
            const user = req.params.user
            await usersCollection.updateOne({ _id: user }, { $set: { blocked: true } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
    unblockUser: async (req, res) => {
        try {
            const user = req.params.user
            await usersCollection.updateOne({ _id: user }, { $set: { blocked: false } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
    loadProductsManagement: async (req, res) => {
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
    },
    activateProduct: async (req, res) => {
        try {
            const prd = req.params.id
            await productsCollection.updateOne({ _id: prd }, { $set: { active: true } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
    deactivateProdcut: async (req, res) => {
        try {
            const prd = req.params.id
            await productsCollection.updateOne({ _id: prd }, { $set: { active: false } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
    deactivateCategory: async (req, res) => {
        try {
            const cat = req.params.id
            await categories.updateOne({ _id: cat }, { $set: { active: false } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
    activateCategory: async (req, res) => {
        try {
            const cat = req.params.id
            await categories.updateOne({ _id: cat }, { $set: { active: true } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
    updateProducts: async (req, res) => {
        try {
            console.log(req.body);
            const prd = req.body

            if (prd.prd_id && prd.prd_name) {
                if (prd.prd_images.length) {
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
                } else {
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
            if (prd.prd_name) {
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
    },
    updateCategories: async (req, res) => {
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
    },
    uploadPrdImage: async (req, res) => {
        try {

            const result = await cloudinary.v2.uploader.upload(`./images/${req.file.originalname}`, {
                public_id: req.file.originalname
            })
            res.json(result.secure_url)
        } catch (error) {
            console.log(error.message);
        }

    },
}
