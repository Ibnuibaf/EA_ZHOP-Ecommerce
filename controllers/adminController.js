const mongoose = require('mongoose')
const admin = require('../models/adminSchema')

const usersCollection = require('../models/usersSchema')
const productsCollection = require('../models/productsSchema')
const categories = require('../models/categorySchema')
const cloudinary = require('cloudinary').v2;

module.exports = {
    loadAdminSignIn: (req, res) => {
        let error

        if (req.query.validation) {
            error = req.query.validation
        }
        res.render('adminSignin', { error })
    },
    postAdminSignIn: async (req, res) => {
        try {
            const { username, password } = req.body
            const isAdmin = await admin.findOne({ username: username })
            console.log(isAdmin)
            if (isAdmin) {
                if (password == isAdmin.password) {
                    req.session.admin = isAdmin.username
                    console.log(req.session.admin);
                    res.redirect('/admin/dashboard?AdminLogged=Admin Logged In!')

                } else {
                    return res.redirect('/admin?validation=Password is Incorrect! Try Again')
                }
            } else {
                return res.redirect(`/admin?validation=Admin Details Doesn't exist!`)
            }
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    loadDashboard: (req, res) => {
        res.render('dashboard')
    },
    loadUsersManagement: async (req, res) => {

        try {
            
            const searchQuery = req.query.search
            let usersList = await usersCollection.find({})
            if (searchQuery) {
                const searchRegex = new RegExp(searchQuery, 'i');
                usersList = usersList.filter(user => searchRegex.test(user.first_name))
            }
            res.render('adminUsers', { usersList })
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    blockUser: async (req, res) => {
        try {
            const user = req.params.user
            await usersCollection.updateOne({ _id: user }, { $set: { blocked: true } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    unblockUser: async (req, res) => {
        try {
            const user = req.params.user
            await usersCollection.updateOne({ _id: user }, { $set: { blocked: false } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.render('error')
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
            res.render('error')
        }
    },
    activateProduct: async (req, res) => {
        try {
            const prd = req.params.id
            await productsCollection.updateOne({ _id: prd }, { $set: { active: true } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    deactivateProdcut: async (req, res) => {
        try {
            const prd = req.params.id
            await productsCollection.updateOne({ _id: prd }, { $set: { active: false } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    deactivateCategory: async (req, res) => {
        try {
            const cat = req.params.id
            await categories.updateOne({ _id: cat }, { $set: { active: false } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    activateCategory: async (req, res) => {
        try {
            const cat = req.params.id
            await categories.updateOne({ _id: cat }, { $set: { active: true } })
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    updateProducts: async (req, res) => {
        try {

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
            res.render('error')
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
            res.render('error')
        }
    },
    uploadPrdImage: async (req, res) => {
        try {

            const result = await cloudinary.uploader.upload(`./images/${req.file.originalname}`, {
                public_id: req.file.originalname
            })
            res.json(result.secure_url)
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }

    },
    adminlogOut: (req, res) => {
        try {
            req.session.destroy((err) => {
                console.log(err);
                res.render('error')
            })
            res.clearCookie('connect.sid')
            res.redirect('/?message=User has been Logged Out!')
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    }
}
