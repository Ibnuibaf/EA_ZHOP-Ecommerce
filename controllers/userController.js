const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Session } = require('express-session')
const nodemailer = require('nodemailer')
const productsCollection = require("../models/productsSchema")
const usersCollection = require("../models/usersSchema");
const categories = require('../models/categorySchema');
const otpVerification = require('../models/otpSchema')
const orders = require('../models/ordersSchema')
const { ObjectId } = require('mongoose').Types;

const securePass = async (pass) => {
    try {
        let hashedPass = await bcrypt.hash(pass, 5)
        return hashedPass
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}
const sendVerificationOTP = async (user, email) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
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
            subject: "Verify Your Email in EA_ZHOP",
            html: `<p>Hey ${user} Here is your Verification OTP: <br> Your OTP is <b>${otp}</b> </p><br>
                    <i>Otp will Expire in 1 Minute</i>`
        }

        const hashOTP = await bcrypt.hash(otp, 10)
        await otpVerification.deleteMany({ user: email });
        const otph = await otpVerification.create({
            user: email,
            otp: hashOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + (60000 * 10) // Expires in 10 minutes
        });

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log("Error occured");
                console.log(err);
                res.send(500)
            }
            else {
                console.log('code is sent');
            }
        })
    } catch (error) {
        console.log(error.message);

        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

module.exports = {
    loadHome: (req, res) => {

        res.render('home')
    },
    loadSignIn: (req, res) => {
        let error
        if (req.query.validation) {
            error = req.query.validation
        }

        res.render('signin', { error })
    },
    postSignin: async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await usersCollection.findOne({ email: email }, { email: 1, password: 1, blocked: 1 })
            if (user) {
                const isPass = await bcrypt.compare(password, user.password)
                if (isPass) {
                    if (!user.blocked) {
                        req.session.user = user.email
                        res.redirect('/')
                    } else {
                        return res.redirect('/signin?validation=Your Account have been Blocked by Admin,Contact for Details')
                    }
                } else {
                    return res.redirect('/signin?validation=Password is Incorrect! Try Again')
                }
            } else {
                return res.redirect(`/signin?validation=User Doesn't exist!`)
            }
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    forgetPass: async (req, res) => {
        try {
            const email = req.query.email
            const userExist = await usersCollection.findOne({ email })
            if (userExist) {
                if (email) {
                    req.session.email = email
                    req.session.paths = "forgetPass"
                    req.session.otpStage = true
                    await sendVerificationOTP(email, email)
                    res.redirect('/verification')
                } else {
                    return res.redirect('/signin?validation=Enter your Email')
                }
            } else {
                return res.redirect(`/signin?validation=User Doesn't exist!`)
            }
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    newPass: async (req, res) => {
        try {
            const passDetails = req.body

            if (passDetails.new_password == passDetails.confirm_password) {
                const hashedPass = await securePass(passDetails.new_password)
                await usersCollection.updateOne({ email: passDetails.user }, { $set: { password: hashedPass } })
                res.redirect('/signin?message=Password Updated!')
            } else {
                res.send(400).json({ message: "Both password does not match" })
            }

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadSignUp: (req, res) => {
        let error
        if (req.query.validation) {
            error = req.query.validation
        }
        else if (req.query.userExistErr) {
            error = req.query.userExistErr
        }
        res.render('signup', { error })
    },
    registerUser: async (req, res) => {
        try {
            req.session.paths = "registerUser"
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
            let frst_name, lst_name, mobile, email, dob, password
            if (req.body.first_name.length && req.body.last_name.length) {
                frst_name = req.body.first_name
                lst_name = req.body.last_name

            } else {
                return res.redirect('/signup/?validation=FirstName and LastName Required')
            }
            if (req.body.mobile_number.length == 10) {
                mobile = req.body.mobile_number
            } else {
                return res.redirect('/signup/?validation=Enter a valid Mobile Number')
            }
            if (req.body.email.length) {
                email = req.body.email
            } else {
                return res.redirect('/signup/?validation=Enter a valid Email')
            }

            if (req.body.confirmPassword == req.body.password) {
                if (passwordRegex.test(req.body.password)) {
                    password = await securePass(req.body.password)
                } else {
                    return res.redirect('/signup/?validation=Password should contain *At least one uppercase or lowercase letter *At least one digit *At least one special character from the set @$!%*#?& *A minimum length of 8 characters')
                }
            } else {
                return res.redirect('/signup/?validation=Password Doesnt Matches')
            }



            req.session.frst_name = frst_name
            req.session.lst_name = lst_name
            req.session.mobile = mobile
            req.session.email = email
            req.session.dob = dob
            req.session.password = password


            const phoneExist = await usersCollection.findOne({ mobile_number: mobile })
            const emailExist = await usersCollection.findOne({ email: email })


            if (phoneExist || emailExist) {
                return res.redirect('/signup?userExistErr=In given details User Already Exist!')
            } else {
                console.log(email);
                await sendVerificationOTP(frst_name, email)
                req.session.otpStage = true
                res.redirect('/verification')
            }

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadVerificationPanel: (req, res) => {
        const email = req.session.email
        let error
        if (req.query.error) {
            error = req.query.error
        }

        res.render("OTPverify", { email, error })
    },
    resendOTP: async (req, res) => {
        try {
            const email = req.query.email
            console.log(email);
            if (email) {
                await sendVerificationOTP(email, email)
                res.redirect('/verification?message=Resend OTP to your email')
            } else {
                res.redirect('/signin?message=Specify your email')
            }
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    verifyEmail: async (req, res) => {
        try {
            let { email, otp } = req.body;
            if (!email || !otp) {
                return res.redirect('/verification?error=Empty otp details are not allowed');
            }

            const otps = await otpVerification.findOne({ user: email });
            console.log(otps);
            if (!otps) {
                return res.redirect(`/verification?error=Account record doesn't exist or has been verified already!`);
            }

            const expiresAt = otps.expiresAt;
            const hashedOTP = otps.otp;

            if (Date.now() > expiresAt) {
                await otpVerification.deleteMany({ user: email });
                return res.redirect('/verification?error=OTP has expired, try again!');
            }

            const otpValid = await bcrypt.compare(otp, hashedOTP);
            console.log(otpValid);
            if (!otpValid) {
                return res.redirect('/verification?error=OTP is not matching');
            }
            let userCreated
            if (req.session.paths == "registerUser") {
                userCreated = await usersCollection.create({
                    first_name: req.session.frst_name,
                    last_name: req.session.lst_name,
                    mobile_number: req.session.mobile,
                    email: req.session.email,
                    password: req.session.password
                });
                req.session.otpStage = false
                req.session.user = userCreated.email
                return res.redirect('/?CreatedAccount=User Account have been Created');
            } else if (req.session.paths == "emailUpdate") {
                req.session.otpStage = false
                const updated = await usersCollection.updateOne({ email: req.session.user },
                    {
                        $set: {
                            first_name: req.session.frst_name,
                            last_name: req.session.lst_name,
                            mobile_number: req.session.mobile,
                            email: req.session.email
                        }
                    })
                if (updated.modifiedCount) {
                    req.session.user = req.session.email
                    return res.redirect('/user/profile?message=Profile Updated Successfully')
                } else {
                    throw new Error('unable to update user now! Try again Later')
                }
            } else if (req.session.paths == "forgetPass") {
                req.session.otpStage = false
                const user = req.session.email
                return res.render('newpassword-tab', { user })
            } else {
                return res.redirect('/')
            }

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadProfile: async (req, res) => {
        const userDetails = req.userDetails

        res.render('profile', { userDetails })
    },
    updateProfile: async (req, res) => {
        try {
            const updatedDetails = req.body
            if (updatedDetails.email != req.session.user) {
                const email = updatedDetails.email
                req.session.paths = "emailUpdate"
                req.session.otpStage = true
                req.session.frst_name = updatedDetails.first_name
                req.session.lst_name = updatedDetails.last_name
                req.session.mobile = updatedDetails.mobile_number
                req.session.email = updatedDetails.email
                sendVerificationOTP(email, email)
                return res.redirect('/verification')
            }
            const updated = await usersCollection.updateOne({ _id: updatedDetails.user_id },
                {
                    $set: {
                        first_name: updatedDetails.first_name,
                        last_name: updatedDetails.last_name,
                        mobile_number: updatedDetails.mobile_number,
                        email: updatedDetails.email
                    }
                })
            if (updated.modifiedCount) {
                req.session.user = updatedDetails.email
                res.redirect('/user/profile?message=Profile Updated Successfully')
            } else {
                res.send(500)
            }
        } catch (error) {
            console.log(error);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    updatePassword: async (req, res) => {
        try {
            const passDetails = req.body
            const userDetails = req.userDetails
            const isMatch = await bcrypt.compare(passDetails.old_password, userDetails.password)
            if (isMatch) {
                if (passDetails.new_password == passDetails.confirm_password) {
                    const hashedPass = await securePass(passDetails.new_password)
                    await usersCollection.updateOne({ _id: userDetails._id }, { $set: { password: hashedPass } })
                    res.redirect('/user/profile?message=Password Updated!')
                } else {
                    res.redirect('/user/profile?message=both password does not matches')
                }
            } else {
                res.redirect('/user/profile?message=Old password does not matches')
            }
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.send(statusCode, error.message)
        }
    },
    uploadAddress: async (req, res) => {
        try {
            const userDetails = req.userDetails
            const address = req.body
            if (address.local_address && address.Country && address.city && address.District && address.State && address.postcode) {
                if (userDetails.address.length >= 4) {
                    await usersCollection.updateOne({ _id: userDetails._id }, { $pop: { address: -1 } })
                }
                await usersCollection.updateOne({ _id: userDetails._id },
                    {
                        $push: {
                            address: {
                                locality: address.local_address,
                                country: address.Country,
                                city: address.city,
                                district: address.District,
                                state: address.State,
                                postcode: address.postcode,
                                altr_number: address.altr_number
                            }
                        }
                    }
                )
                res.redirect('/user/profile?message=Added new Address')
            } else {
                res.redirect('/user/profile?message=Fill all the address field')
            }
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.send(statusCode, error.message)
        }
    },
    deleteAddress: async (req, res) => {
        try {
            const address = req.params.id
            const userDetails = req.userDetails
            await usersCollection.updateOne({ _id: userDetails._id },
                {
                    $pull: {
                        address: {
                            _id: address
                        }
                    }
                }
            )
            res.send(200)
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.send(statusCode, error.message)
        }
    },
    loadOrders: async(req, res) => {
        try {
            const userDetails=req.userDetails
            const orderDetails = await orders.aggregate([
                { $match: { consumer: userDetails._id } },
                {
                    $lookup: {
                        from: "products",
                        localField: "prd_id",
                        foreignField: "_id",
                        as: "order_detials"
                    }
                },
                {$unwind:"$order_detials"},
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
                }}
            ])
            res.render('myorders',{orderDetails})
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.send(statusCode, error.message)
        }
    },
    cancelOrder:async(req,res)=>{
        try {
            const order=req.query.order;
            const isUpdated=await orders.updateOne({_id:order},{$set:{status:"canceled"}})
            res.redirect('/user/orders')
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.send(statusCode, error.message)
        }
    },
    returnOrder:async(req,res)=>{
        try {
            const order=req.query.order
            await orders.updateOne({_id:order},{$set:{returned:true}})
            res.redirect('/user/orders')
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.send(statusCode, error.message)
        }
    },
    loadProductView: async (req, res) => {
        try {
            const filterMin = req.query.min
            const filterMax = req.query.max
            const searchQuery = req.query.search
            const category = req.query.category
            const categoriesList = await categories.find()
            let productsList = await productsCollection.find()
            let foundCategory = ''

            if (category) {
                const catObjectId = new mongoose.Types.ObjectId(category);
                productsList = productsList.filter(products => products.category.equals(catObjectId))
                foundCategory = categoriesList.find(category => category._id.equals(catObjectId));
            }
            if (filterMax || filterMin) {
                productsList = productsList.filter(products => products.mrp > filterMin && products.mrp < filterMax)
            }
            if (searchQuery) {
                const searchRegex = new RegExp(searchQuery, 'i');
                productsList = productsList.filter(products => searchRegex.test(products.prd_name))
            }
            return res.render('products', { productsList, categoriesList, foundCategory });

        } catch (error) {
            console.log(error.stack);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadProductDetails: async (req, res) => {
        try {
            const prd_id = req.params.id
            const user = req.session.user
            const productDetails = await productsCollection.findOne({ _id: prd_id })
            const userDetails = await usersCollection.findOne({ email: user })
            let isWishlist
            let isCart
            if (userDetails) {
                isWishlist = userDetails.wishlist.find((prd) => prd == prd_id)
                userDetails.cart.forEach(item => {
                    if (item.prd_id == prd_id) {
                        isCart = true
                        return
                    }
                });
            }

            res.render('product-details', { productDetails, isWishlist, isCart })
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }

    },
    removeFromWishlist: async (req, res) => {
        try {
            const prd_id = req.params.id
            const user = req.session.user

            const result = await usersCollection.updateOne({ email: user }, { $pull: { wishlist: prd_id } })
            res.send(200)



        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    addToWishlist: async (req, res) => {
        try {
            const prd_id = req.params.id
            const user = req.session.user

            const result = await usersCollection.updateOne({ email: user }, { $push: { wishlist: prd_id } })
            res.send(200)

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    addToCart: async (req, res) => {
        try {
            const prd_id = req.params.id
            const prdDetails = await productsCollection.findOne({ _id: prd_id })
            console.log(prdDetails);

            const user = req.session.user
            const exist = await usersCollection.findOne({ email: user, "cart.prd_id": prd_id })
            if (!exist) {
                const unit_prize = Math.floor(prdDetails.mrp - ((prdDetails.mrp * prdDetails.discount) / 100))
                const total_prize = unit_prize
                const result = await usersCollection.updateOne({ email: user }, { $push: { cart: { prd_id, unit_prize, total_prize } } })
            }
            res.send(200)
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadCart: async (req, res) => {
        try {
            const user = req.session.user
            const cartItems = await usersCollection.aggregate([
                { $match: { email: user } },
                {
                    $unwind: "$cart"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "cart.prd_id",
                        foreignField: "_id",
                        as: "cartProduct"
                    }
                },
                {
                    $unwind: "$cartProduct"
                },
                {
                    $project: {
                        _id: 1,
                        email: 1,
                        "cartProduct.prd_name": 1,
                        "cartProduct.price": 1,
                        "cartProduct.prd_images": 1,
                        "cartProduct.mrp": 1,
                        "cartProduct.discount": 1,
                        "cartProduct._id": 1,
                        "cartProduct.stock": 1,
                        "cart.qty": 1,
                        "cart.unit_prize": 1,
                        "cart.total_prize": 1,
                    }
                }
            ])
            const wishlistItems = await usersCollection.aggregate([
                { $match: { email: user } },
                {
                    $unwind: "$wishlist"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "wishlist",
                        foreignField: "_id",
                        as: "wishlistProduct"
                    }
                },
                {
                    $unwind: "$wishlistProduct"
                },
                {
                    $project: {
                        _id: 1,
                        email: 1,
                        "wishlistProduct.prd_name": 1,
                        "wishlistProduct.prd_images": 1,
                        "wishlistProduct._id": 1,
                        "wishlistProduct.mrp": 1,
                        "wishlistProduct.discount": 1,
                    }
                }
            ])
            console.log(cartItems, wishlistItems);
            res.render('cart', { cartItems, wishlistItems })
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    updateQty: async (req, res) => {
        const user = req.session.user;
        const productId = req.body.productId;
        const action = req.body.action;

        try {
            const filter = {
                "email": user,
                "cart.prd_id": productId
            };

            const update = {};
            if (action == "increase") {
                update.$inc = { "cart.$.qty": 1 };
            } else if (action == "decrease") {
                update.$inc = { "cart.$.qty": -1 };
            }
            const cartItem = await usersCollection.findOne(filter, { "cart.$": 1 });
            const updatedQty = cartItem.cart[0].qty + (action == "increase" ? 1 : -1);
            const totalPrize = updatedQty * cartItem.cart[0].unit_prize;
            update.$set = { "cart.$.total_prize": totalPrize };
            const options = {
                returnOriginal: false
            };
            const updatedDocument = await usersCollection.findOneAndUpdate(filter, update, options);
            if (updatedDocument) {
                const updatedCartItem = updatedDocument.cart.find(item => item.prd_id == productId);
                res.status(200).json({ quantity: updatedQty, total_prize: updatedCartItem.total_prize });
            } else {
                res.status(404).json({ message: "Product not found in cart." });
            }
        } catch (error) {
            console.error("Error updating cart:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },
    removeFromCart: async (req, res) => {
        try {
            const prd_id = req.params.id
            const user = req.session.user
            const result = await usersCollection.updateOne({ email: user }, { $pull: { cart: { prd_id } } })
            res.send(200)

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadCheckout: async (req, res) => {
        const itemSpecified = req.query.item
        const userDetails = req.userDetails
        let productDetails
        if (itemSpecified) {
            productDetails = await productsCollection.findById(itemSpecified)

        } else {
            productDetails = await usersCollection.aggregate([
                { $match: { _id: userDetails._id } },
                {
                    $unwind: "$cart"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "cart.prd_id",
                        foreignField: "_id",
                        as: "cartProduct"
                    }
                },
                {
                    $unwind: "$cartProduct"
                },
                {
                    $project: {
                        _id: 1,
                        email: 1,
                        prd_name: "$cartProduct.prd_name",
                        prd_images: "$cartProduct.prd_images",
                        mrp: "$cartProduct.mrp",
                        discount: "$cartProduct.discount",
                        prd_id: "$cartProduct._id",
                        stock: "$cartProduct.stock",
                        qty: "$cart.qty",
                        unit_prize: "$cart.unit_prize",
                        total_prize: "$cart.total_prize",
                    }
                }
            ])
        }
        res.render('checkout', { productDetails, userDetails })
    },
    confirmOrder: async (req, res) => {
        try {
            const data = req.body
            const userDetails = req.userDetails
            if (!data.pay_methods) {
                return res.redirect('/user/checkout?message=Choose any of Payment Methods')
            }
            if (data.local_address && data.country && data.postcode && data.city && data.district && data.state && data.altr_number) {
                console.log(data);
                if (data.pay_methods == "cod") {
                    if (Array.isArray(data.prd_id)) {
                        
                            for (let index = 0; index < data.prd_id.length; index++) {
                                if ( parseInt(data.qty[index]) > parseInt(data.stock[index])) {
                                    // console.log(index,data.qty[index],data.stock[index]);
                                    return res.redirect('/user/checkout?message=Some of the products quantity is excessive, Remove them from cart');
                                }
                
                                const order = {
                                    prd_id: data.prd_id[index],
                                    address: {
                                        locality: data.local_address,
                                        country: data.country,
                                        district: data.district,
                                        state: data.state,
                                        city: data.city,
                                        altr_number: data.altr_number,
                                        postcode: data.postcode
                                    },
                                    date: Date.now(),
                                    amount: parseFloat(data.total_price[index]),
                                    consumer: userDetails._id,
                                    mobile_number: userDetails.mobile_number,
                                    payment: data.pay_methods,
                                    qty: parseInt(data.qty[index])
                                };
                
                                await orders.create(order); 
                                await productsCollection.updateOne({ _id: order.prd_id }, { $inc: { stock: -order.qty } });
                            }
                            
                            

                    } else {
                        if (data.qty > data.stock) {
                            return res.redirect('/user/checkout?message=Some of the products quantity is excesive, Remove them from cart')
                        }

                        const order = {
                            prd_id: data.prd_id,
                            address: {
                                locality: data.local_address,
                                country: data.country,
                                district: data.district,
                                state: data.state,
                                city: data.city,
                                altr_number: data.altr_number,
                                postcode: data.postcode
                            },
                            date: Date.now(),
                            amount: parseFloat(data.total_price),
                            consumer: userDetails._id,
                            mobile_number: userDetails.mobile_number,
                            payment: data.pay_methods,
                            qty: parseInt(data.qty)
                        }
                        await orders.create(order)
                        await productsCollection.updateOne({_id:data.prd_id},{$inc:{stock:-1}})
                    }

                    res.redirect('/user/profile?message=Order Placed Successfuly!')
                } else {
                    res.redirect('/user/checkout?message=The selected payment method is not available now')
                }
            } else {
                return res.redirect('/user/checkout?message=Fill the Address order to be delivered')
            }
        } catch (error) {
            console.log(error.message);
            return res.status(500).send("Internal Server Error");
        }
    },
    logOut: (req, res) => {
        try {
            req.session.destroy((err) => {
                console.log(err);
                res.status(500)
            })
            res.clearCookie('connect.sid')
            res.redirect('/?message=User has been Logged Out!')
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    deactivateAccount: async (req, res) => {
        const userDetails = req.userDetails
        await usersCollection.updateOne({ _id: userDetails._id }, { $set: { blocked: true } })
        req.session.destroy((err) => {
            console.log(err);
            res.status(500)
        })
        res.clearCookie('connect.sid')
        res.redirect('/?message=Your Account has been destroyed')
    }
}