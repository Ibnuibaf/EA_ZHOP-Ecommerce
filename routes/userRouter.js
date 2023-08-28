const express = require('express');
const controller=require('../controllers/userController')
const middle=require('../middleware/userMiddleware')



const router = express.Router();

//home
router.get('/',controller.loadHome);

//signin
router.get('/signin',middle.notLogged, controller.loadSignIn);

router.post('/signin',middle.notLogged,controller.postSignin)

router.get('/forgetpassword',controller.forgetPass)
router.post('/user/new-password',controller.newPass)

//signup
router.get('/signup',middle.notLogged,controller.loadSignUp);

router.post('/signup',middle.notLogged,controller.registerUser)

//otp
router.get('/verification',middle.verificationPanel,controller.loadVerificationPanel)
router.get('/resend-otp',controller.resendOTP)

router.post('/otp',middle.verificationPanel,controller.verifyEmail)

//profile
router.get('/user/profile',middle.loggedIn,controller.loadProfile)
router.post('/user/profile-update',middle.loggedIn,controller.updateProfile)
router.post('/user/update-password',middle.loggedIn,controller.updatePassword)
router.post('/user/add-address',middle.loggedIn,controller.uploadAddress)
router.delete('/user/rem-address/:id',middle.loggedIn,controller.deleteAddress)

//products-view
router.get('/user/products', controller.loadProductView);
router.get('/user/products/product-details/:id', controller.loadProductDetails)
router.patch('/user/add-wishlist/:id',middle.loggedIn,controller.addToWishlist)
router.delete('/user/rem-wishlist/:id',middle.loggedIn,controller.removeFromWishlist)
router.patch('/user/add-cart/:id',controller.addToCart)
router.delete('/user/rem-cart/:id',controller.removeFromCart)

//cart
router.get('/user/cart',middle.loggedIn,controller.loadCart)
router.patch('/user/cart/update-qty',controller.updateQty)

//orders
router.get('/user/orders',middle.loggedIn,controller.loadOrders)
router.patch('/user/cancel-order/:order',middle.loggedIn,controller.cancelOrder)
router.patch('/user/return-order/:order',middle.loggedIn,controller.returnOrder)

//checkout
router.get('/user/checkout',middle.loggedIn,middle.ordered,controller.loadCheckout)
router.get('/user/checkout/verify-coupen/:code',middle.loggedIn,controller.verifyCoupen)
router.post('/user/confirm-order',middle.loggedIn,controller.confirmOrder)
router.post('/user/checkout/verify-payment',middle.loggedIn,controller.verifyPayment)

//logout
router.get('/logout',middle.loggedIn,controller.logOut)
router.get('/deactivate-user',middle.loggedIn,controller.deactivateAccount)

module.exports = router;
