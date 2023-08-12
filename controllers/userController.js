const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Session } = require('express-session')
const nodemailer = require('nodemailer')
const productsCollection = require("../models/productsSchema")
const usersCollection = require("../models/usersSchema");
const categories = require('../models/categorySchema');
const otpVerification = require('../models/otpSchema')
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
        const otph = await otpVerification.create({
            user: email,
            otp: hashOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000
        })

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log("Error occured");
                console.log(err);
                const statusCode = err.status || 500;
                res.status(statusCode).send(err.message);
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
            req.session.paths = "signup"
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
    verifyEmail: async (req, res) => {
        try {
            let { email, otp } = req.body;
            if (!email || !otp) {
                return res.redirect('/verification?error=Empty otp details are not allowed');
            }

            const otps = await otpVerification.findOne({ user: email });
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

            const userCreated = await usersCollection.create({
                first_name: req.session.frst_name,
                last_name: req.session.lst_name,
                mobile_number: req.session.mobile,
                email: req.session.email,
                password: req.session.password
            });

            if (userCreated) {
                req.session.user = userCreated.email
                req.session.otpStage = false
                return res.redirect('/?CreatedAccount=User Account have been Created');
            }
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadProfiles: (req, res) => {
        res.render('profile')
    },
    loadOrders: (req, res) => {
        res.render('myorders')
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
                    if (item == prd_id) {
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


        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    addToCart: async (req, res) => {
        try {
            const prd_id = req.params.id
            const user = req.session.user
            const result = await usersCollection.updateOne({ email: user }, {$push:{cart:prd_id}})
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
            const userItems = await usersCollection.aggregate([
                { $match: { email: user } },
                {
                    $lookup: {
                        from: "products",
                        localField: "cart",
                        foreignField: "_id",
                        as: "cartProducts"
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "wishlist",
                        foreignField: "_id",
                        as: "wishlistProducts"
                    }
                },
            ])
            console.log(userItems);
            res.render('cart', { userItems })
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    removeFromCart: async (req, res) => {
        try {
            const prd_id = req.params.id
            const user = req.session.user
            const result = await usersCollection.updateOne({ email: user }, {$pull:{cart:prd_id}})
            res.send(200)

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    loadCheckout: (req, res) => {
        res.render('checkout')
    },
    logOut: (req, res) => {
        try {
            req.session.destroy((err) => {
                console.log(err);
                const statusCode = err.status || 500;
                res.status(statusCode).send(err.message);
            })
            res.clearCookie('connect.sid')
            res.redirect('/?message=User has been Logged Out!')
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    }
}