const express = require('express');
const adminRouter = express();
const adminController = require('../controller/adminController');
const productsController = require('../controller/productsController');
const catagorieController = require('../controller/catagorieController');
const orderController = require('../controller/orderController');
const adminAuth = require('../middleware/adminAuth');
const sessionSecret = require('../config/session');
const session = require('express-session');
const upload = require('../config/multer').upload;
//--------------------------------------------------------------



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
adminRouter.get('/orders',adminAuth.isLogin,adminController.loadOrders);
adminRouter.get('/placed_orders',adminAuth.isLogin,orderController.placedOrder);
adminRouter.get('/deliverd_orders',adminAuth.isLogin,orderController.orderDeliverd);
adminRouter.get('/cancel_orders',adminAuth.isLogin,adminController.cancelOrders);

//POST method
adminRouter.post('/categories',catagorieController.addCategorie);
adminRouter.post('/',adminController.dologinAdmin);
adminRouter.post('/addProducts',upload.array('images',10),productsController.AddProducts);
adminRouter.post('/editProduct/:productId',productsController.updateProducts)
    


module.exports = adminRouter;
