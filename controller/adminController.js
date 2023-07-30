const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productsModel");
const ProductOffer = require("../models/productOfferModel");
const Category = require("../models/categoriesModel");
const Offer = require("../models/categorieOfferModel");
const Banner = require("../models/bannerModel");
const bcrypt = require("bcrypt");
//-----------------------------------------------------
const ITEMS_PER_PAGE = 10;

// load login page of admin
const loadLogin = async (req, res) => {
  try {
      res.render("./admin/adminLogin");
  } catch (error) {
    console.log("loding error in admin pannel");
  }
};

//admin do login
const dologinAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await User.findOne({ is_admin: 1 });
    if (adminData) {
      const PASSWORD = await bcrypt.compare(password, adminData.password);
      if (PASSWORD && email === adminData.email) {
        req.session.admin_id = adminData._id; // session keeping.
        res.redirect("/admin/dashboard");
      } else {
        res.render("./admin/adminLogin",{message:"invalid email or password"});
      }
    } else {
      res.render("./admin/adminLogin",{message:"invalid email or password"});
    }
  } catch (error) {
    console.log(error.message);
  }
};

// logout
const admindDoLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session:", err);
      } else {
        res.redirect("/admin");
      }
    });
  } catch (error) {
    console.log("Error in doLogout:", error);
  }
};

//load Dashboard
const loadDashboard = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    res.render("./admin/dashboard", { admin: admin });
  } catch (error) {
    console.log("admin dashboard error");
  }
};


// user list.
const loadUsersList = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    let { search, status, page, itemsPerPage } = req.query;
    page = parseInt(page) || 1;
    itemsPerPage = parseInt(itemsPerPage) || ITEMS_PER_PAGE;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { email: { $regex: new RegExp(search, 'i') } },
      ];
    }

    if (status) {
      if (status === 'active') {
        query.is_blocked = false;
      } else if (status === 'blocked') {
        query.is_blocked = true;
      }
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    res.render('./admin/usersList', {
      admin: admin,
      users: users,
      search,
      status,
      currentPage: page,
      totalPages,
      ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error('Error occurred while loading Load products page:', error);
    res.status(500).send('Error occurred while loading Load addProducts page.');
  }
};


// Do user block
const usersBlock = async (req, res) => {
  try {
    const userId = req.params.userId;
    const findUser = await User.findOne({ _id: userId });
    if (findUser.is_blocked === true) {
      res.redirect("/admin/usersList");
    } else {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { is_blocked: true } }
      );
      res.redirect("/admin/usersList");
    }
  } catch (error) {
    console.log(error.message);
    console.error('Error occurred while loading user block  page:', error);
    res.status(500).send('Error occurred while loading user block  page.');
  }
};

// unblock user
const usersUnblock = async (req, res) => {
  try {
    const userId = req.params.userId;
    const findUser = await User.findOne({ _id: userId });
    if (findUser.is_blocked === false) {
      res.redirect("/admin/usersList");
    } else {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { is_blocked: false } }
      );
      res.redirect("/admin/usersList");
    }
  } catch (error) {
    console.log(error.message);
  }
};



// load orders
const loadOrders = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    let { search, status, page, itemsPerPage } = req.query;
    page = parseInt(page) || 1;
    itemsPerPage = parseInt(itemsPerPage) || ITEMS_PER_PAGE;

    const query = {};

    if (search) {
      query.order_Id = search;
    }

    if (status) {
      query.status = status;
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (orders) {
      res.render('./admin/orders', {
        admin: admin,
        order: orders,
        search,
        status,
        currentPage: page,
        totalPages,
        ITEMS_PER_PAGE,
      });
    } else {
      res.render('./admin/orders', { admin: admin, message: 'No order placed!!' });
    }
  } catch (error) {
    console.log('admin orders page error');
  }
};


// view orders
// const viewOrders = async(req,res)=>{
//   try {
//     const admin = req.session.admin_id;
//     const orderId = req.params.orderId;
//     const cartData = await Cart.findOne({
//       userName: req.session.user_id,
//     }).populate("products.productId");

//     const categoryOffer = await Offer.find({status:'Active'}).populate('category');
//     const productOffer = await ProductOffer.find({status:'Active'}); 
//     // const category = await Category.find({status:true});
//     const orderData = await Order.findOne({_id:orderId}).populate({ path: "products.productId", select: "name images price" }).exec();
//     if(orderData){

//       if (cartData.products.length > 0) {

//         const products = cartData.products;
//         let totalPriceUpdate = 0;

//         for(const item of products){

//           const productId = item.productId._id;
//           const proData = await Product.findOne({_id:productId});
//           const quantity = item.count;
//           const proOfferMatch = productOffer.find((x) => x.productName.equals(productId));
//           const offerMatch = categoryOffer.find((x) => x.category._id.equals(proData.category));
//           if(proOfferMatch && offerMatch){

//             const offerPrice = proData.price - ((proData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage))/100);
//             totalPriceUpdate += quantity * offerPrice;
//           }else if(proOfferMatch && !offerMatch){

//             const offerPrice = proData.price - ((proData.price * proOfferMatch.discountPercentage)/100);
//             totalPriceUpdate += quantity * offerPrice;
//           }else if(offerMatch && !proOfferMatch){

//             const offerPrice = proData.price - ((proData.price * offerMatch.discountPercentage )/100);
//             totalPriceUpdate += quantity * offerPrice;
//           }else{
//             totalPriceUpdate += quantity * proData.price;
//           }
//          }

//          res.render('./admin/pageOrdersDetails',{admin:admin,orderData:orderData,products,totalPriceUpdate})
//       }

//     }
//   } catch (error) {
//     res.status(500).json({ message: "Error while processing view orders." });
//   } 
// }


// cancel Orders
const cancelOrders = async (req,res)=>{
  try {
    const id = req.query.id;
    const orderData = await Order.findById(id);
    if (orderData) {
      const order = await Order.findByIdAndUpdate(id, { status: "cancelled" });
      res.redirect("/admin/orders");
    }else{
      res.redirect("/admin/orders");
    }
  } catch (error) {
    console.log("error while loading");
  }
}


// Banner Controller
const listBanner = async (req,res)=>{
  try {
    const admin = req.session.admin_id;
    const bannerData = await Banner.find();
    if(admin){
      res.render('./admin/listBanner',{admin:admin, bannerData:bannerData})
    }
  } catch (error) {
    console.log(error.message);

  }
}

// Load add banner page
const addBannerPage = async (req,res)=>{
  try {
    const admin = req.session.admin_id;
    res.render('./admin/addBannerPage',{admin:admin})
  } catch (error) {
    console.log(error.message);
  }
}

// Adding Banner data
const addBanner = async (req,res)=>{
  try {
    const images = req.file.filename;
    const { bannerTitle, description } = req.body;
    const bannerData = new Banner({
      bannerTitle,
      description,
      images,
    });

    const saveBanner = await bannerData.save();
    if(saveBanner){
      res.redirect('/admin/viewBannerList')
      console.log("banner Added")
    } else {
      res.redirect('/admin/addBannerPage')
      console.log("banner failed")
    }
  } catch (error) {
    console.log(error.message);
  }
}

// edit Banner 
// const editBannerPage = async (req,res)=>{
//   try {
//     const admin = req.session.admin_id;
//     const bannerId = req.params.bannerID;
//     const bannerData = await Banner.findById(bannerId);
//     if (bannerData) {
//       res.render('./admin/editBannerPage',{admin:admin, bannerData:bannerData});
//     }else{
//       res.redirect('/admin/viewBannerList')
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// edit Banner
// const editBanner = async (req,res)=>{
//   try {
//      const { bannerTitle, description } = req.body;
//     const bannerData = await Banner
//       .findByIdAndUpdate(
//         { _id: bannerId },
//         {
//           $set: {
//             bannerTitle,
//             description,
//           },
//         }
//       )
//       .exec();
//       if(bannerData){
//         res.redirect('/admin/viewBannerList')
//       }else{
//         res.render('')
//       }
//   } catch (error) {
    
//   }
// }


const deleteBanner = async (req,res) => {
  try {
    const bannerId = req.params.bannerID;
    const bannerData = await Banner.findById({_id:bannerId});
    if(bannerData){
      await Banner.deleteMany({ _id: bannerId });
      res.redirect('/admin/viewBannerList');
      console.log("Banner deleted!");
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loadLogin,
  dologinAdmin,
  loadDashboard,
  loadOrders,
  admindDoLogout,
  loadUsersList,
  usersBlock,
  usersUnblock,
  cancelOrders,
  listBanner,
  addBannerPage,
  addBanner,
  // editBannerPage,
  // editBanner
  deleteBanner,
  // viewOrders
};
