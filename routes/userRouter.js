const express = require('express');
const controller=require('../controllers/userController')
const middle=require('../middleware/userMiddleware')



const router = express.Router();

//home
router.get('/',controller.loadHome);

//signin
router.get('/signin',middle.notLogged, controller.loadSignIn);

router.post('/signin',middle.notLogged,controller.postSignin)

//signup
router.get('/signup',middle.notLogged,controller.loadSignUp);

router.post('/signup',middle.notLogged,controller.registerUser)

//otp
router.get('/verification',middle.verificationPanel,controller.loadVerificationPanel)

router.post('/otp',middle.notLogged,controller.verifyEmail)

//profile
router.get('/user/profile',middle.loggedIn,controller.loadProfiles)

//products-view
router.get('/user/products', controller.loadProductView);
router.get('/user/products/product-details/:id', controller.loadProductDetails)
router.patch('/user/add-wishlist/:id',middle.loggedIn,controller.addToWishlist)
router.delete('/user/rem-wishlist/:id',middle.loggedIn,controller.removeFromWishlist)
router.patch('/user/add-cart/:id',controller.addToCart)
router.delete('/user/rem-cart/:id',controller.removeFromCart)

//cart
router.get('/user/cart',controller.loadCart)

//orders
router.get('/user/orders',middle.loggedIn,controller.loadOrders)

//checkout
router.post('/user/checkout',middle.loggedIn,controller.loadCheckout)

//logout
router.get('/logout',middle.loggedIn,controller.logOut)

module.exports = router;
