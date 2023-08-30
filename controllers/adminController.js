const mongoose = require('mongoose')
const admin = require('../models/adminSchema')

const usersCollection = require('../models/usersSchema')
const productsCollection = require('../models/productsSchema')
const categories = require('../models/categorySchema')
const coupens = require('../models/coupenSchema')
const banners = require('../models/bannerSchema')
const nodemailer = require('nodemailer')
const { Parser } = require('json2csv')
const fs = require('fs')
const cloudinary = require('cloudinary').v2;


const sendRefundNotificationMail = (email, amount) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.verifyAppEmail,
            pass: process.env.verifyAppPassword
        }
    })
    const mailOptions = {
        from: process.env.verifyAppEmail,
        to: email,
        subject: "Returned Orders Refund Added to Your Wallet",
        html: `<h3 style="color:red;">Your Amount of order returned lately added to you EA_ZHOP Wallet ₹${amount}/-</h3><br>
                <p style="color:grey;">Check your account profile of ${email} and verify!</p><br><i>Enjoy you future journey with <b style="color:red;">EAZHOP</b></i>`
    }
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
            res.send(500)
        } else {
            console.log("Email Send Successfully");
        }
    })
}

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
                console.log(prd.prd_images);
                if (prd.prd_images.length) {
                    await productsCollection.updateOne({ _id: prd.prd_id }, {
                        $set: {
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
                        $set: {
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
            console.log(prd_id, image);
            await productsCollection.updateOne(
                { _id: prd_id },
                { $pull: { prd_images: image } }
            );

            res.status(200).json({ success: true });
        } catch (error) {
            console.error(error.message);
            res.sendStatus(500);
        }
    },
    loadOrdersManagement: async (req, res) => {
        try {

            let orderList = await usersCollection.aggregate([
                { $unwind: "$orders" },
                {
                    $lookup: {
                        from: "products",
                        localField: "orders.products.prd_id",
                        foreignField: "_id",
                        as: "products_details"
                    }
                },
                {
                    $project: {
                        order_id: "$orders._id",
                        products: "$orders.products",
                        products_details: "$products_details",
                        total_amount: "$orders.total_amount",
                        order_date: "$orders.order_date",
                        payment_method: "$orders.payment_method",
                        address: "$orders.address",
                        consumer: "$email",
                        phone_number: "$mobile_number",
                    }
                },
                { $sort: { "order_id": -1 } }
            ])
            // console.log(orderList)
            if (req.query.search) {
                const searchRegex = new RegExp(req.query.search, 'i')
                orderList = orderList.filter((order) => searchRegex.test(order.order_id) || searchRegex.test(order.payment_method) || searchRegex.test(order.consumer) || searchRegex.test(order.phone_number))
            }
            res.render('adminOrders', { orderList })
        } catch (error) {
            console.log(error.message);
            res.render('error')
        }
    },
    cancelOrder: async (req, res) => {
        try {
            const order = req.params.order;
            const email = req.body.user
            console.log(order, email);
            const isUpdated = await usersCollection.updateOne(
                {
                    email: email,
                    "orders.products._id": order
                },
                {
                    $set: { "orders.$.products.$[product].status": "canceled" }
                },
                {
                    arrayFilters: [
                        { "product._id": order }
                    ]
                }
            );
            res.status(200).json({ success: true })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    orderRefund: async (req, res) => {
        try {
            const order = req.body._id
            const consumer = req.body.user
            const amount = req.body.price
            const payment = req.body.payment
            await usersCollection.updateOne(
                { email: consumer, "orders.products._id": order },
                { $set: { "orders.$.products.$[product].refunded": true, "orders.$.products.$[product].status": "canceled" } },
                {
                    arrayFilters: [
                        { "product._id": order }
                    ]
                }
            )
            if (payment == "razor_pay") {
                await usersCollection.updateOne({ email: consumer }, { $inc: { "wallet.balance": amount }, $push: { "wallet.transactions": `${amount} from order ${order}` } })
                await sendRefundNotificationMail(consumer, amount)

            }

            res.status(200).json({ success: true })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    updateOrderStatus: async (req, res) => {
        try {
            const updatedStatus = req.body.status
            const consumer = req.body.email
            const orderId = req.params.id
            await usersCollection.updateOne(
                { email: consumer, "orders.products._id": orderId },
                { $set: { "orders.$.products.$[product].status": updatedStatus } },
                {
                    arrayFilters: [
                        { "product._id": orderId }
                    ]
                }
            )
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    loadBannersManagement: async (req, res) => {
        try {
            const bannerList = await banners.find()
            const categoriesList = await categories.find({ active: true })
            res.render('adminBanner', { bannerList, categoriesList })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    createBanner: async (req, res) => {
        try {
            const bannerDetails = req.body
            let bannerExist = await banners.find({ banner: bannerDetails.banner })
            console.log(bannerExist);
            if (!bannerExist.length) {
                await banners.create(bannerDetails)
                res.send(200)
            }
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    removeBanner: async (req, res) => {
        try {
            const banner = req.params.id
            const result = await banners.findByIdAndDelete(banner)
            res.send(200)
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    loadCoupensManagement: async (req, res) => {
        try {
            const coupensList = await coupens.find().sort({ active: 1 })
            res.render('adminCoupens', { coupensList })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    updateCoupen: async (req, res) => {
        try {
            let coupenDetails = req.body
            const exist = await coupens.findOne({ coupon_code: coupenDetails.coupon_code })
            if (exist && !coupenDetails.coupon_id) {
                return res.redirect('/admin/coupens-management?adminMessage=Coupen exist')
            }
            if (coupenDetails.coupon_id) {
                await coupens.updateOne({ _id: coupenDetails.coupon_id }, coupenDetails)

                res.redirect('/admin/coupens-management?adminMessage=Coupen Updated')
            } else {
                coupenDetails.start_date = Date.now()
                await coupens.create(coupenDetails)
                res.redirect('/admin/coupens-management?adminMessage=New Coupen Activated')
            }
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    removeCoupen: async (req, res) => {
        try {
            const coupen = req.params.id
            await coupens.findByIdAndDelete(coupen)
            res.status(200).json({ success: true })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    activateCoupen: async (req, res) => {
        try {
            const coupen = req.params.id;
            await coupens.updateOne({ _id: coupen }, { $set: { active: true } })
            res.status(200).json({ success: true })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    deactivateCoupen: async (req, res) => {
        try {
            const coupen = req.params.id;
            await coupens.updateOne({ _id: coupen }, { $set: { active: false } })
            res.status(200).json({ success: true })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    loadSalesReport: async (req, res) => {
        try {
            const from = req.query.from
            const to = req.query.to
            let salesReport = await usersCollection.aggregate([
                { $unwind: "$orders" },
                { $unwind: "$orders.products" },
                { $match: { "orders.products.status": "closed" } },
                {
                    $lookup: {
                        from: "products",
                        localField: "orders.products.prd_id",
                        foreignField: "_id",
                        as: "products_details"
                    }
                },
                { $unwind: "$products_details" },
                {
                    $project: {
                        order_id: "$orders._id",
                        products_details: "$products_details",
                        qty: "$orders.products.qty",
                        total_amount: "$orders.products.price",
                        order_date: "$orders.order_date",
                        payment_method: "$orders.payment_method",
                        consumer: "$email",
                    }
                },
                { $sort: { "order_id": -1 } }
            ])
            if (from && to) {
                const fromDate = new Date(from);
                const toDate = new Date(to);

                salesReport = salesReport.filter((prd) => {
                    const orderDate = new Date(prd.order_date);
                    return orderDate >= fromDate && orderDate <= toDate;
                });
                console.log(salesReport)
            }

            res.render('adminSales', { salesReport })
        } catch (error) {
            console.log(error.message);
            res.send(500)
        }
    },
    salesReportDownload: (req, res) => {
        try {
            const data = req.body
            let file = [];
            for (let i = 0; i < data.date.length; i++) {
                const row = {
                    date: data.date[i],
                    order_id: data.order_id[i],
                    consumer: data.consumer[i],
                    product: data.product[i],
                    qty: data.qty[i],
                    payment: data.payment[i],
                    amount: data.amount[i]
                };
                file.push(row);
            }
            const json2csv = new Parser()
            const csv = json2csv.parse(file)
            
            res.attachment(`report-${Date.now()}.csv`)
            res.status(200).send(csv)
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
