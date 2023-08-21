const mongoose = require('mongoose')
const admin = require('../models/adminSchema')

const usersCollection = require('../models/usersSchema')
const productsCollection = require('../models/productsSchema')
const orders=require('../models/ordersSchema')
const categories = require('../models/categorySchema')
const banners=require('../models/bannerSchema')
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
                    res.redirect('/admin/dashboard?adminMessage=Admin Logged In!')

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
                        $set:{
                            prd_name: prd.prd_name,
                            description: prd.prd_desc,
                            additional_info: prd.prd_addinfo,
                            category: prd.prd_category,
                            discount: prd.prd_discount,
                            mrp: prd.prd_mrp,
                            stock: prd.prd_stock,
                            purchase: prd.prd_purchase,
                            
                        },
                        $push: {
                            prd_images: prd.prd_images
                        }
                    }, { upsert: true })
                } else {
                    await productsCollection.updateOne({ _id: prd.prd_id }, {
                        $set:{
                            prd_name: prd.prd_name,
                            description: prd.prd_desc,
                            additional_info: prd.prd_addinfo,
                            category: prd.prd_category,
                            discount: prd.prd_discount,
                            mrp: prd.prd_mrp,
                            stock: prd.prd_stock,
                            purchase: prd.prd_purchase
                        }
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
            const existName = await categories.findOne({ name: cat.cat_name })
            if (existName) {
                return res.redirect('/admin/products-management?adminMessage=category exist')
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
    uploadImage: async (req, res) => {
        try {
            const result = await cloudinary.uploader.upload(`./images/${req.file.originalname}`, {
                public_id: req.file.originalname
            })
            res.json(result.secure_url)
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }

    },
    removeImage: async (req, res) => {
        try {
          const prd_id = req.body.prd_id;
          const image = req.body.image;
            console.log(prd_id,image);
          await productsCollection.updateOne(
            { _id: prd_id },
            { $pull: { prd_images: image } }
          );
      
          res.sendStatus(200);
        } catch (error) {
          console.error(error.message);
          res.sendStatus(500);
        }
      },
    loadOrdersManagement:async(req,res)=>{
        try {
            
            const orderList = await orders.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "prd_id",
                        foreignField: "_id",
                        as: "order_detials"
                    }
                },
                {$unwind:"$order_detials"},
                {$lookup:{
                    from:"users",
                    localField:"consumer",
                    foreignField:"_id",
                    as:"user_details"
                }},
                {$unwind:"$user_details"},
                {$project:{
                    prd_id:1,
                    date:1,
                    address:1,
                    status:1,
                    returned:1,
                    amount:1,
                    mobile_number:1,
                    payment:1,
                    qty:1,
                    prd_name:"$order_detials.prd_name",
                    prd_images:"$order_detials.prd_images",
                    user:"$user_details.email",
                }},
                {$sort:{_id:-1}}
            ])
            res.render('adminOrders',{orderList})
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    cancelOrder:async(req,res)=>{
        try {
            const order=req.query.order;
            const isUpdated=await orders.updateOne({_id:order},{$set:{status:"canceled"}})
            res.redirect('/admin/orders-management')
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    updateOrderStatus:async (req,res)=>{
        try {
            const updatedStatus=req.body.status
            const orderId=req.params.id
            await orders.updateOne({_id:orderId},{$set:{status:updatedStatus}})
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    loadBannersManagement:async(req,res)=>{
        try {
            const bannerList = await banners.find()
            const categoriesList=await categories.find({active:true})
            res.render('adminBanner',{bannerList,categoriesList})
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    createBanner:async(req,res)=>{
        try {
            const bannerDetails=req.body
            let bannerExist=await banners.find({banner: bannerDetails.banner})
            console.log(bannerExist);
            if(!bannerExist.length){
                await banners.create(bannerDetails)
                res.send(200)
            }
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    removeBanner:async(req,res)=>{
        try {
            const banner=req.params.id
            const result=await banners.findByIdAndDelete(banner)
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    adminlogOut: (req, res) => {
        try {
            req.session.destroy((err) => {
                console.log(err);
                res.render('error')
            })
            res.clearCookie('connect.sid')
            res.redirect('/?adminMessage')
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    }
}
