const express = require('express');
const userRouter = express();
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController');
const addressController = require('../controller/addressController');
const couponController = require('../controller/couponController');
const wishlistController = require('../controller/wishController');
const sessionSecret = require('../config/session');
const session = require('express-session');
const userAuth = require('../middleware/userAuth');
//--------------------------------------------------------------

//session handling
userRouter.use(session({
    secret:sessionSecret.sessionSecret,
    resave: true,
    saveUninitialized:true,
}));

//GET method // routes in user side.
userRouter.get('/',userController.loadHome);
userRouter.get('/register',userController.loadRegisterPage);
userRouter.get('/login',userAuth.isLogout,userController.loadLoginPage);
userRouter.get('/loadLoginOtpPage',userAuth.isLogout,userController.loadLoginOtpPage);
userRouter.get('/logout',userController.doLogout);
userRouter.get('/product-details/:productId',userController.loadProductDetailsPage);
userRouter.get('/shop',userController.loadShopPage); 
userRouter.get('/cart',userAuth.isLogin,cartController.loadCartPage);
userRouter.get('/removeProduct',userAuth.isLogin,cartController.removeProduct);
userRouter.get('/checkout',userAuth.isLogin,cartController.loadCheckout);
userRouter.get('/addAddress',userAuth.isLogin,addressController.loadAddressPage);
userRouter.get('/account',userAuth.isLogin,userController.loadAccountPage);
userRouter.get('/cancel_order',userAuth.isLogin,orderController.cancelOrders);
userRouter.get('/forgetPassword',userAuth.isLogout,userController.loadForgetPassword);
userRouter.get('/wishlist',userAuth.isLogin,wishlistController.loadWishlist);
userRouter.get('/removeWishlist/:id',userAuth.isLogin,wishlistController.removeWishlist);
userRouter.get('/addFromWish/:id',userAuth.isLogin,wishlistController.addFromWish);


//POST method // routes in user side.
userRouter.post('/register',userController.doRegister);
userRouter.post('/verification',userController.doVerify);
userRouter.post('/login',userController.doLogin);
userRouter.post('/add-to-cart',cartController.addToCart);
userRouter.post('/changeProductQuantity', cartController.changeProductQuantity);
userRouter.post('/addAddress',addressController.addAddress);
userRouter.post('/order',orderController.doOrder);
userRouter.post('/change-account-details',userController.changeAcctDetails);
userRouter.post('/forgetPassword',userController.doforgetPassword);
userRouter.post('/forget_password',userController.forgetPassword);
userRouter.post('/forgtOtpVerify',userController.doForOtpVerify);
userRouter.post('/verifyPayment', orderController.verifyPayment);
userRouter.post('/addToWishlist',wishlistController.addToWishlist);
userRouter.post('/applyCoupon',couponController.applyCoupon);
userRouter.post('/loginOtpVerify',userController.loginOtp);



module.exports = userRouter;