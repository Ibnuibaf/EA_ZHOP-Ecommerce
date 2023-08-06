const express = require('express');
const controller=require('../controllers/userController')
const middle=require('../middleware/userMiddleware')



const router = express.Router();

//home
router.get('/',controller.loadHome);

//signin
router.get('/signin',controller.loadSignIn);

//signup
router.get('/signup',controller.loadSignUp);

//products-view
router.get('/user/products', controller.loadProductView);
router.get('/user/products/product-details/:id', controller.loadProductDetails)
router.delete('/user/products/product-details/rem-wishlist/:id',controller.removeFromWishlist)
router.patch('/user/products/product-details/add-wishlist/:id',controller.addToWishlist)



module.exports = router;
