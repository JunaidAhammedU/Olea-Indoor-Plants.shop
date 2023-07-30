const express = require('express');
const adminRouter = express();
const adminController = require('../controller/adminController');
const productsController = require('../controller/productsController');
const catagorieController = require('../controller/catagorieController');
const couponController = require('../controller/couponController');
const orderController = require('../controller/orderController');
const offerController = require('../controller/offerController');
const adminAuth = require('../middleware/adminAuth');
const sessionSecret = require('../config/session');
const session = require('express-session');
const upload = require('../config/multer').upload;
//-------------------------------------------------------------------------



//session handling
adminRouter.use(session({
    secret:sessionSecret.sessionSecret,
    resave: true,
    saveUninitialized:true,
}));


//GET method // routes in admin pannel.
adminRouter.get('/',adminAuth.isLogout,adminController.loadLogin);
adminRouter.get('/adminLogout',adminController.admindDoLogout);
adminRouter.get('/dashboard',adminAuth.isLogin,adminController.loadDashboard);
adminRouter.get('/products',adminAuth.isLogin,productsController.loadProducts);
adminRouter.get('/orders',adminAuth.isLogin,adminController.loadOrders);
adminRouter.get('/categories',adminAuth.isLogin,catagorieController.loadCategories);
adminRouter.get('/deleteCategory/:categoryId',adminAuth.isLogin,catagorieController.deleteCategory);
adminRouter.get('/addProducts',adminAuth.isLogin,productsController.loadAddProducts);
adminRouter.get('/editProduct/:productId',adminAuth.isLogin,productsController.loadEditProduct);
adminRouter.get('/unlistProduct/:productId',adminAuth.isLogin,productsController.unlistProduct);
adminRouter.get('/listProduct/:productId',adminAuth.isLogin,productsController.listProduct);
adminRouter.get('/usersList',adminAuth.isLogin,adminController.loadUsersList);
adminRouter.get('/userBlock/:userId',adminAuth.isLogin,adminController.usersBlock);
adminRouter.get('/userUnblock/:userId',adminAuth.isLogin,adminController.usersUnblock);

adminRouter.get('/view_orders/:orderId',adminAuth.isLogin,adminController.viewOrders);

adminRouter.get('/orders',adminAuth.isLogin,adminController.loadOrders);
adminRouter.get('/placed_orders',adminAuth.isLogin,orderController.placedOrder);
adminRouter.get('/deliverd_orders',adminAuth.isLogin,orderController.orderDeliverd);
adminRouter.get('/cancel_orders',adminAuth.isLogin,adminController.cancelOrders);
adminRouter.get('/coupon',adminAuth.isLogin,couponController.addCoupon);
adminRouter.get('/viewCouponList',adminAuth.isLogin,couponController.viewCouponList);
adminRouter.get('/editCoupon/:couponId',adminAuth.isLogin,couponController.loadEditCoupon);
adminRouter.get('/deleteCoupon/:couponId',adminAuth.isLogin,couponController.deleteCoupon);
adminRouter.get('/loadProductOfferList',adminAuth.isLogin,offerController.loadProductOfferList);
adminRouter.get('/editProductOffer/:offerId',adminAuth.isLogin,offerController.editProductOffer);
//adminRouter.get('/editCategoryOffer/:offerId',adminAuth.isLogin,offerController.editCategoryOffer);
adminRouter.get('/loadCategoryOfferList',adminAuth.isLogin,offerController.loadCategoryOfferList);
adminRouter.get('/addProductOffer',adminAuth.isLogin,offerController.addProductOffer);
adminRouter.get('/addCategoryOffer',adminAuth.isLogin,offerController.addCategoryOffer);
adminRouter.get('/viewBannerList',adminAuth.isLogin,adminController.listBanner);
adminRouter.get('/addBanner',adminAuth.isLogin,adminController.addBannerPage);
// adminRouter.get('/editBanner/:bannerID',adminAuth.isLogin,adminController.editBannerPage); 
adminRouter.get('/deleteBanner/:bannerID',adminAuth.isLogin,adminController.deleteBanner); 

 
//POST method
adminRouter.post('/categories',catagorieController.addCategorie);
adminRouter.post('/',adminController.dologinAdmin);
adminRouter.post('/addProducts',upload.array('images',10),productsController.AddProducts);
adminRouter.post('/editProduct/:productId',upload.array('images',10),productsController.updateProducts)
adminRouter.post('/coupon',couponController.postAddCoupon);
adminRouter.post('/editCoupon/:couponId',couponController.editCoupon);
adminRouter.post('/addCategoryOffer',offerController.getCategoryOffer);
adminRouter.post('/addProductOffer',offerController.getProductOffer);
adminRouter.post('/addBanner',upload.single('images'),adminController.addBanner);
// adminRouter.post('/editBanner',adminController.editBanner);
adminRouter.post('/editProductOffer',adminAuth.isLogin,offerController.updateProductOffer);




module.exports = adminRouter;
