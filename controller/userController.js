const UserVerification = require("../models/userVerification");
const otpHelper = require("../helpers/otpHelper");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const Product = require("../models/productsModel");
const Categories = require("../models/categoriesModel");
const ProductOffer = require("../models/productOfferModel");
const Offer = require("../models/categorieOfferModel");
const Banner = require("../models/bannerModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
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
    const bannerData = await Banner.find();

    const currentDate = new Date();
    const categoryOfferCheck = await Offer.find();

    for (const offer of categoryOfferCheck) {
      if (offer.endDate <= currentDate) {
        await Offer.updateOne(
          { _id: offer._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await Offer.updateOne(
          { _id: offer._id },
          { $set: { status: "Active" } }
        );
      }
    }

    const productOfferCheck = await ProductOffer.find();
    for (const offer of productOfferCheck) {
      if (offer.endDate <= currentDate) {
        await ProductOffer.updateOne(
          { _id: offer._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await ProductOffer.updateOne(
          { _id: offer._id },
          { $set: { status: "Active" } }
        );
      }
    }

    const categoryOffer = await Offer.find({ status: "Active" });
    const productOffer = await ProductOffer.find({ status: "Active" });

    res.render("./user/index", {
      userId,
      products: productData,
      bannerData: bannerData,
      categoryOffer,
      productOffer,
    });
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
      res.json({ existUser: true });
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
        await registerOtpSend(email);
        res.render("./user/otpVerify", { email });
      } else {
        console.log("Data not received");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// Send OTP verification email
const registerOtpSend = async (email) => {
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

// resend Otp
const resendOtp = async (req, res) => {
  try {
    const email = req.query.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      let resendOtp = await otpHelper.ResendOtp(email);
      await UserVerification.findOneAndUpdate(
        { email: email },
        { $set: { otp: resendOtp } }
      );
      res.render("./user/otpVerify", { email });
    } else {
      res.redirect("/register");
    }
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
      console.log("Registration verification success");
    } else {
      res.redirect("/register");
    }
  } catch (error) {
    console.error("Error occurred while doLogin. ", error);
    res.status(500).send("Error occurred while doLogin.");
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
          req.session.loginData = email;
          res.redirect("/loadLoginOtpPage");
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

// Load Login Otp page
const loadLoginOtpPage = async (req, res) => {
  try {
    const loginData = req.session.loginData;
    let loginOtpData = await otpHelper.sendLoginOTPEmail(loginData);
    res.render("./user/loginOtpVerify", { loginOtpData: loginOtpData });
    req.session.loginData = null;
  } catch (error) {
    console.error("Error occurred while loading doLogin ", error);
    res.status(500).send("Error occurred while loading doLogin.");
  }
};

// OTP verification in Login Page
const loginOtp = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.userData });
    if (userData && req.body.otp === req.body.userOtp) {
      req.session.user_id = userData._id; // session keeping.
      res.redirect("/");
      console.log("Login verification success");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error occurred Post OTP doLogin ", error);
    res.status(500).send("Error occurred Post OTP doLogin.");
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
    const catData = await Categories.findById({ _id: productData.category });
    const catName = catData.categorieName;

    const currentDate = new Date();
    const categoryOfferCheck = await Offer.find();
    for (const offer of categoryOfferCheck) {
      if (offer.endDate <= currentDate) {
        await Offer.updateOne(
          { _id: offer._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await Offer.updateOne(
          { _id: offer._id },
          { $set: { status: "Active" } }
        );
      }
    }

    const productOfferCheck = await ProductOffer.find();
    for (const offer of productOfferCheck) {
      if (offer.endDate <= currentDate) {
        await ProductOffer.updateOne(
          { _id: offer._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await ProductOffer.updateOne(
          { _id: offer._id },
          { $set: { status: "Active" } }
        );
      }
    }

    const categoryOffer = await Offer.find({ status: "Active" });
    const productOffer = await ProductOffer.find({ status: "Active" });

    res.render("./user/product-details", {
      userId,
      product: productData,
      catName,
      categoryOffer,
      productOffer,
    });
  } catch (error) {
    console.error("Error occurred while loading product details page ", error);
    res.status(500).send("Error occurred while loading product details page.");
  }
};

// Load Shop page
const loadShopPage = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const price = req.query.value;
    let category = req.query.category || "All";
    let Search = req.query.Search || "";
    Search = Search.trim();

    const categoryData = await Categories.find({ status: true });
    let cat = categoryData.map((category) => category.categorieName);

    let sort;
    category === "All"
      ? (category = [...cat])
      : (category = req.query.category.split(","));
    req.query.value === "High" ? (sort = -1) : (sort = 1);
    let catId = [];

    for (let i = 0; i < categoryData.length; i++) {
      if (
        category.includes(categoryData[i].categorieName) ||
        category === "All"
      ) {
        catId.push(categoryData[i]._id);
      }
    }

    const searchQuery = req.query.search || "";

    const searchFilter = searchQuery.trim()
      ? { name: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    const productData = await Product.aggregate([
      {
        $match: {
          ...searchFilter,
          category: { $in: catId },
          status: true,
        },
      },
      { $sort: { price: sort } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const productCount = await Product.countDocuments({
      name: { $regex: Search, $options: "i" },
      status: true,
      category: { $in: catId },
    });
    const totalPage = Math.max(1, Math.ceil(productCount / limit));

    const currentDate = new Date();
    const categoryOfferCheck = await Offer.find();
    for (const offer of categoryOfferCheck) {
      if (offer.endDate <= currentDate) {
        await Offer.updateOne(
          { _id: offer._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await Offer.updateOne(
          { _id: offer._id },
          { $set: { status: "Active" } }
        );
      }
    }

    const productOfferCheck = await ProductOffer.find();
    for (const offer of productOfferCheck) {
      if (offer.endDate <= currentDate) {
        await ProductOffer.updateOne(
          { _id: offer._id },
          { $set: { status: "Expired" } }
        );
      } else {
        await ProductOffer.updateOne(
          { _id: offer._id },
          { $set: { status: "Active" } }
        );
      }
    }

    const categoryOffer = await Offer.find({ status: "Active" });
    const productOffer = await ProductOffer.find({ status: "Active" });

    const userName = await User.findOne({ _id: req.session.user_id });

    if (req.session.user_id) {
      const customer = true;
      res.render("./user/shop", {
        customer,
        userName,
        products: productData,
        category: categoryData,
        page,
        Search,
        price,
        totalPage,
        cat: category,
        categoryOffer,
        productOffer,
      });
    } else {
      const customer = false;
      res.render("./user/shop", {
        customer,
        products: productData,
        category: categoryData,
        page,
        Search,
        price,
        totalPage,
        cat: category,
        categoryOffer,
        productOffer,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Load Account Page
const loadAccountPage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    if (userId) {
      const user = await User.findById(req.session.user_id);
      const orders = await Order.find({ userId });
      const addressData = await Address.findOne({ userId });
      const address = addressData.addresses;
      res.render("./user/account.ejs", { user, order: orders, address });
    } else {
      res.redirect("/logout");
    }
  } catch (error) {
    console.log("load error in account page");
  }
};

// change user acount details
const changeAcctDetails = async (req, res) => {
  try {
    if (req.session.user_id) {
      const { name, lastName, email, currentPassword, password, confirmPass } =
        req.body;

      const existingUser = await User.findById(req.session.user_id);
      if (!existingUser) {
        return res.redirect("/logout");
      }
      const Password = await bcrypt.compare(
        currentPassword,
        existingUser.password
      );

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
            password: newPassword,
          },
        }
      );
      res.redirect("/logout");
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
const loadForgetPassword = async (req, res) => {
  try {
    res.render("./user/verificationEmail");
  } catch (error) {
    console.log("reset password error");
  }
};

// forget password
const doforgetPassword = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      Fotp = "";
      sendForgetOTPEmail(userData.email);
      res.render("./user/forgtOtpVerify", { user: userData });
    } else {
      res.redirect("/verificationEmail");
      alert("invalid email");
    }
  } catch (error) {
    console.log("reset password error");
  }
};

// forget pss otp verifivation.
const doForOtpVerify = async (req, res) => {
  try {
    const otp = req.body.otp;
    const userData = await User.findOne({ _id: req.query.id });
    if (Fotp === otp) {
      res.render("./user/forget_password", { user: userData });
    } else {
      res.redirect("/register");
    }
  } catch (error) {
    res.redirect("/register");
  }
};

// forget password
const forgetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const userId = req.query.id;

    if (password === confirmPassword) {
      const newPass = await securePassword(password);
      if (newPass) {
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            $set: {
              password: newPass,
            },
          }
        );
        res.redirect("/login");
      } else {
        console.log("not working secure password!");
      }
    } else {
      res.redirect("/forget_password");
    }
  } catch (error) {
    console.log("forget password not working!");
  }
};

module.exports = {
  loadHome,
  loadLoginPage,
  doLogin,
  loadRegisterPage,
  doRegister,
  doLogout,
  doVerify,
  loadProductDetailsPage,
  loadShopPage,
  loadAccountPage,
  changeAcctDetails,
  loadForgetPassword,
  doforgetPassword,
  doForOtpVerify,
  forgetPassword,
  loadLoginOtpPage,
  loginOtp,
  resendOtp,
};
