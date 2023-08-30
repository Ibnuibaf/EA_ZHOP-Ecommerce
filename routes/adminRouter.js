const express = require('express');
const controller=require('../controllers/adminController')
const middle=require('../middleware/adminMiddleware')


const router = express.Router();



//signin
router.get('/',middle.notlogged,controller.loadAdminSignIn);
router.post('/',middle.notlogged,controller.postAdminSignIn)

//dashboard
router.get('/dashboard',middle.loggedIn,controller.loadDashboard);
router.get('/users-management',middle.loggedIn, controller.loadUsersManagement);

//users management

router.patch('/users-management/block-user/:user',middle.loggedIn,controller.blockUser)
router.patch('/users-management/unblock-user/:user',middle.loggedIn,controller.unblockUser)

//products management
router.get('/products-management',middle.loggedIn,controller.loadProductsManagement);

router.patch('/products-management/active/:id',middle.loggedIn, controller.activateProduct)
router.patch('/products-management/deactive/:id',middle.loggedIn, controller.deactivateProdcut)

router.patch('/products-management/deactiveCategory/:id',middle.loggedIn, controller.deactivateCategory)
router.patch('/products-management/activeCategory/:id',middle.loggedIn, controller.activateCategory)

router.post("/products-management/uploadImage",middle.uploadImage, controller.uploadImage)
router.delete('/products-management/remove-image',middle.loggedIn,controller.removeImage)

router.post('/products-management/update-prd',middle.loggedIn, controller.updateProducts)
router.post('/products-management/updateCategory',middle.loggedIn, controller.updateCategories)

//orders management
router.get('/orders-management',middle.loggedIn,controller.loadOrdersManagement)
router.patch('/orders-management/cancel-order/:order',middle.loggedIn,controller.cancelOrder)
router.patch('/update-order-status/:id',middle.loggedIn,controller.updateOrderStatus)
router.patch('/orders-management/order-refund/:order',middle.loggedIn,controller.orderRefund)

//banners management
router.get('/banners-management',middle.loggedIn,controller.loadBannersManagement)
router.post("/create-banner/uploadImage",middle.uploadImage, controller.uploadImage)
router.post('/create-banner',middle.loggedIn, controller.createBanner)
router.delete('/delete-banner/:id',middle.loggedIn, controller.removeBanner)

//coupens management
router.get('/coupens-management',middle.loggedIn,controller.loadCoupensManagement)
router.post('/coupens-management/update-coupen',middle.loggedIn, controller.updateCoupen)
router.delete('/coupens-management/delete-coupen/:id',middle.loggedIn, controller.removeCoupen)
router.patch('/coupens-management/activate-coupen/:id',middle.loggedIn, controller.activateCoupen)
router.patch('/coupens-management/deactivate-coupen/:id',middle.loggedIn, controller.deactivateCoupen)


//sales report
router.get('/sales-report', controller.loadSalesReport)
router.post('/sales-report/download-report',controller.salesReportDownload)

//logout
router.get('/logout',middle.loggedIn,controller.adminlogOut)


module.exports = router;
