const express = require('express');
const controller=require('../controllers/adminController')
const middle=require('../middleware/adminMiddleware')


const router = express.Router();



//signin
router.get('/',controller.loadSignIn);

//dashboard
router.get('/dashboard',controller.loadDashboard);

//users management
router.get('/users-management',controller.loadUsersManagement);

router.patch('/users-management/block-user/:user',controller.blockUser)
router.patch('/users-management/unblock-user/:user',controller.unblockUser)

//products management
router.get('/products-management',controller.loadProductsManagement);

router.patch('/products-management/active/:id', controller.activateProduct)
router.patch('/products-management/deactive/:id', controller.deactivateProdcut)

router.patch('/products-management/deactiveCategory/:id', controller.deactivateCategory)
router.patch('/products-management/activeCategory/:id', controller.activateCategory)

router.post("/products-management/uploadImage", middle.uploadImage,controller.uploadPrdImage)

router.post('/products-management/update-prd', controller.updateProducts)
router.post('/products-management/updateCategory', controller.updateCategories)




module.exports = router;
