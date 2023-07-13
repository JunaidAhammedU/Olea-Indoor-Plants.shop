const Product = require('../models/productsModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Razorpay = require('razorpay');
require("dotenv").config();
//---------------------------------------------------


//razorPay instence
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// Do order
const doOrder = async (req,res)=>{
    try{
        const oderDetails = req.body;
        const userName = await User.findById({_id:req.session.user_id});
        const Total = parseInt(req.body.totalAmount);
        const cartData = await Cart.findOne({userName:req.session.user_id});
        const products = cartData.products;
        const address = await Address.findOne({userId:req.session.user_id});
        const paymentMethod = req.body.payment_method;
        const totalPrice = parseInt(req.body.totalAmount);
        const discount = parseInt(req.body.discountAmount);
        const wallet = totalPrice - Total - discount;
        const status = paymentMethod === "COD" ? "placed" : "pending";

        const order = new Order({
            House_number_and_street: address.addresses[0].House_number_and_street,
            userEmail: address.addresses[0].email,
            userPhone: address.addresses[0].phone,
            userCityAdd: address.addresses[0].City,
            userId:req.session.user_id,
            paymentMethod:paymentMethod,
            userName:userName.name,
            products:products,
            totalAmount:Total,
            Amount:totalPrice,
            date:new Date(),
            status:status,
            orderWallet:wallet
        })
        
        const orderData = await order.save();
        const date = orderData.date.toISOString().substring(5,7);
        const orderId = orderData._id;
        
        if (orderData) {
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].productId;
              const count = Number(products[i].count)
              await Product.findByIdAndUpdate({ _id: pro }, { $inc: { productQuantity: -count } });              
            }
            if(paymentMethod === "COD"){
                const wal = totalPrice - Total;
                await Order.updateOne({_id:orderId},{$set:{month:date}})
                await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
                await Cart.deleteOne({userName:req.session.user_id});  
                return res.json({codStatus:true});
            }else{
              const totalAmount = orderData.totalAmount;
            let order = await instance.orders.create({
                amount: totalAmount*100,
                currency:"INR",
                receipt:"" + orderId,
               }); 
               return res.json({onlinePayment:true , order})
            }
        }else{
            res.redirect('/checkout');
        }
    }catch(error){
        console.log(error.message);
    }
}

const verifyPayment = async (req,res)=>{
  try{

    const details = req.body;
    console.log(details.payment.razorpay_order_id);
    // const crypto = require('crypto');
    // let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
    // hmac.update(details['payment.razorpay_order_id']+'|'+details['payment.razorpay_payment_id']);
    // hmac = hmac.digest('hex');
    // if(hmac==details['payment[razorpay_signature]']){
    //     await Order.findByIdAndUpdate(details['order.receipt'],{$set:{status:"placed"}});
    //     await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
    //     await Order.findByIdAndUpdate(details['order[receipt]'],{$set:{paymentId:details['payment.razorpay_payment_id']}});
    //     await Cart.deleteOne({userName:req.session.user_id});
    //     return res.json({success:true});
    // }else{
    //     await Order.findByIdAndRemove(details['order.receipt']);
    //     return res.json({success:false});
    // }
  }catch(error){
      console.log(error.message);
  }
}


//=========================================================================

const orderSuccess = async (req,res)=>{
  try{
      const userName = await User.findOne({_id:req.session.user_id});
      if(req.session.user_id){
          let customer = true;
         res.render('ordersuccess',{userName,customer});
      }
  }catch(error){
      console.log(error.message);
  }
}

const placedOrder = async (req,res)=>{
    try {
      const id = req.query.id;
      const orderData = await Order.findById(id);
      if (orderData) {
        const order = await Order.findByIdAndUpdate(id, { status: "placed" });
        res.redirect("/admin/orders");
      }else{
        res.redirect("/admin/orders");
      }
    } catch (error) {
      console.log("error while loading    ");
    }
  }
  
  // deliverd oder
  const orderDeliverd = async (req,res)=>{
    try {
      const id = req.query.id;
      const orderData = await Order.findById(id);
      if (orderData) {
        const order = await Order.findByIdAndUpdate(id, { status: "delivered" });
        res.redirect("/admin/orders");
      }else{
        res.redirect("/admin/orders");
      }
    } catch (error) {
      console.log("error while loading    ");
    }
  }
  
  // cancel Orders
  const cancelOrders = async (req,res)=>{
    try {
      const id = req.query.id;  
      const orderData = await Order.findById(id);
      if (orderData) {
        const order = await Order.findByIdAndUpdate(id, { status: "cancelled" });
        res.redirect("/account");
      }else{
        res.redirect("/account");
      }
    } catch (error) {
      console.log("error while loading");
    }
  }






module.exports = {
  doOrder,
  verifyPayment,
    placedOrder,
    orderDeliverd,
    cancelOrders,
    orderSuccess
}