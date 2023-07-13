const User = require("../models/userModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcrypt");
//-----------------------------------------------------

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
        req.session.admin_id = adminData._id;
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

//  Load user list
const loadUsersList = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const userData = await User.find();
    res.render("./admin/usersList", { admin: admin, users: userData });
  } catch (error) {
    console.error("Error occurred while loading Load products page:", error);
    res.status(500).send("Error occurred while loading Load addProducts page.");
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

// Load Orders
const loadOrders = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const orders = await Order.find();
    if (orders) {
      res.render("./admin/orders",{admin:admin, order: orders, });
    } else {
      res.render("./admin/orders",{admin:admin,messsage:"No order placed!!"});
    }
  } catch (error) {
    console.log("admin orders page error");
  }
};


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


module.exports = {
  loadLogin,
  dologinAdmin,
  loadDashboard,
  loadOrders,
  admindDoLogout,
  loadUsersList,
  usersBlock,
  usersUnblock,
  cancelOrders
};
