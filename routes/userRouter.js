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
router.get('/verification',middle.notLogged,controller.loadVerificationPanel)

router.post('/otp',middle.notLogged,controller.verifyEmail)

//profile
router.get('/user/profile',middle.loggedIn,controller.loadProfile)

//products-view
router.get('/user/products', controller.loadProductView);
router.get('/user/products/product-details/:id', controller.loadProductDetails)
router.delete('/user/products/product-details/rem-wishlist/:id',middle.loggedIn,controller.removeFromWishlist)
router.patch('/user/products/product-details/add-wishlist/:id',middle.loggedIn,controller.addToWishlist)

//logout
router.get('/logout',middle.loggedIn,controller.logOut)

module.exports = router;
