const UserVerification = require("../models/userVerification");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const Product = require("../models/productsModel");
const Order = require("../models/orderModel");
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
require("dotenv").config();
//---------------------------------------------------------------

// Setup bcrypt password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    throw new Error("Error occurred while hashing password");
  }
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// Loading Home Page
const loadHome = async (req, res) => {
  try {
    let userId = req.session.user_id;
    const productData = await Product.find();
    res.render("./user/index", { userId, products: productData});
  } catch (error) {
    console.log("Error loading Home page:", error);
  }
};

// Load Register Page
const loadRegisterPage = async (req, res) => {
  try {
    res.render("./user/register");
  } catch (error) {
    console.log("Error loading register page:", error);
  }
};

// Do Register
const doRegister = async (req, res) => {
  try {
    let email = req.body.email;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      res.send("user allready exist!!!")
    } else {
      const PASSWORD = await securePassword(req.body.password);
      const { name, lastName, email } = req.body;
      const userData = new User({
        name,
        lastName,
        email,
        password: PASSWORD,
        is_admin: 0,
      });
      const savedUser = await userData.save();
      if (savedUser) {
        await sendOTPVerificationEmail(email);
        res.render("./user/otpVerify");
      } else {
        console.log("Data not received");
      }
    }
  } catch (error) {
    console.log("Error in doRegister:", error);
  }
};

// Send OTP verification email
const sendOTPVerificationEmail = async (email) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Olea OTP Verification",
      text: `Your OTP is ${otp}. Please enter this OTP to verify your account.`,
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent to user");
    const verificationData = new UserVerification({
      email,
      otp,
    });
    await verificationData.save();
  } catch (error) {
    console.log("Error sending OTP verification email:", error.message);
  }
};

//do Verify
const doVerify = async (req, res) => {
  try {
    const otp = req.body.otp;
    const otpData = await UserVerification.findOne({ otp: otp });
    if (otpData.otp === otp) {
      await User.updateOne(
        { email: otpData.email },
        { $set: { is_verified: 1 } }
      );
      await UserVerification.deleteMany({ email: otpData.email });
      res.redirect("/login");
      console.log("verification success");
    } else {
      res.redirect("/register");
    }
  } catch (error) {
    res.redirect("/register");
  }
};

// Loading Login Page
const loadLoginPage = async (req, res) => {
  try {
    if (req.session.user_id) {
      res.redirect("/");
    } else {
      res.render("./user/login");
    }
  } catch (error) {
    console.log("Error loading login page:", error);
  }
};

// Do login
const doLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      if (existingUser.is_blocked === false) {
        const PASSWORD = await bcrypt.compare(password, existingUser.password);
        if (PASSWORD) {
          req.session.user_id = existingUser._id;
          res.redirect("/");
          console.log("Login successful");
        } else {
          res.render("./user/login", { message: "invalid email or password" });
        }
      } else {
        res.render("./user/login", { message: "Your account is blocked!!" });
      } 
    } else {
      res.render("./user/login", { message: "invalid email or password" });
    }
  } catch (error) {
    console.error("Error occurred while loading doLogin ", error);
    res.status(500).send("Error occurred while loading doLogin.");
  }
};

// Do logout
const doLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.error("Error occurred while loading doLogout ", error);
    res.status(500).send("Error occurred while loading doLogout.");
  }
};

// load product page
const loadProductDetailsPage = async (req, res) => {
  try {
    let userId = req.session.user_id;
    const productId = req.params.productId;
    const productData = await Product.findOne({ _id: productId });
    res.render("./user/product-details", { userId, product: productData });
  } catch (error) {
    console.error("Error occurred while loading product details page ", error);
    res.status(500).send("Error occurred while loading product details page.");
  }
};

// Load Account Page
const loadAccountPage = async (req,res)=>{
  try {
    const userId = req.session.user_id;
    if (userId) {
      const user = await User.findById(req.session.user_id);
      const orders = await Order.find({ userId });
      const addressData = await Address.findOne({userId});
      const address = addressData.addresses;
      res.render('./user/account.ejs',{user,order:orders,address});
    } else {
      res.redirect('/logout');
    }
  } catch (error) {
    console.log('load error in account page');
  }
}

// change user acount details
const changeAcctDetails = async (req, res) => {
  try {
    if (req.session.user_id) {
      const { name, lastName, email, currentPassword, password, confirmPass } = req.body;
      
      const existingUser = await User.findById(req.session.user_id);
      if (!existingUser) {
        return res .redirect("/logout");
      }
      const Password = await bcrypt.compare(currentPassword, existingUser.password);

      if (!Password) {
        return res.send("Your current password is wrong.");
      }
      
      if (password !== confirmPass) {
        return res.send("Your new password and confirm password do not match.");
      }
      const newPassword = await securePassword(password);
      const newUserDetail = await User.updateOne(
        { _id: req.session.user_id },
        {
          $set: {
            name,
            lastName,
            email,
            password:newPassword,
          },
        }
      );
      res.redirect('/logout');
    } else {
      res.redirect("/logout");
    }
  } catch (error) {
    console.log("Error in updating account details:", error);
    res.send("An error occurred while updating account details.");
  }
};


// forget password otp genarating.
let Fotp = "";
const sendForgetOTPEmail = async (email) => {
  try {
    Fotp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Olea Forget OTP Verification",
      text: `Your OTP is ${Fotp}. Please enter this OTP to verify your account.`,
    };
    await transporter.sendMail(mailOptions);
    console.log(Fotp);
    console.log("Email sent to user");
  } catch (error) {
    console.log("Error sending OTP verification email:", error.message);
  }
};

// forget password 
const loadForgetPassword = async (req,res)=>{
  try {
    res.render('./user/verificationEmail');
  } catch (error) {
    console.log("reset password error");
  }
}

// forget password 
const doforgetPassword = async (req,res)=>{
  try {
    const userData = await User.findOne({email:req.body.email});
    if (userData) {
      Fotp = ""
      sendForgetOTPEmail(userData.email);
      res.render("./user/forgtOtpVerify",{user:userData});
    } else {
      res.redirect('/verificationEmail');
      alert("invalid email");
    }
  } catch (error) {
    console.log("reset password error");

  }
}

// forget pss otp verifivation.
const doForOtpVerify = async (req, res) => {
  try {
    const otp = req.body.otp;
    const userData = await User.findOne({_id:req.query.id});
    if (Fotp === otp) {
      res.render('./user/forget_password',{user:userData});
    } else {
      res.redirect("/register");
    }
  } catch (error) {
    res.redirect("/register");
  }
};

const forgetPassword = async(req,res)=>{
  try {
    const {password , confirmPassword} = req.body;
    const userId = req.query.id;

    if (password === confirmPassword) {
      const newPass = await securePassword(password);
      if (newPass) {
        await User.findByIdAndUpdate({_id:userId},
          {
          $set:
          {
            password:newPass,
          }
        })
        res.redirect('/login');
      } else {
        console.log("not working secure password!");
      }
    } else {
      res.redirect('/forget_password');
    }
  } catch (error) {
    console.log("forget password not working!");
  }
}



module.exports = {
  loadHome,
  loadLoginPage,
  doLogin,
  loadRegisterPage,
  doRegister,
  doLogout,
  doVerify,
  loadProductDetailsPage,
  loadAccountPage,
  changeAcctDetails,
  loadForgetPassword,
  doforgetPassword,
  doForOtpVerify,
  forgetPassword
};
