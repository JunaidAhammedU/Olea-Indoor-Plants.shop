const Product = require('../models/productsModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Razorpay = require('razorpay');
require("dotenv").config();
//-------------------------------------------------


//razorPay instence
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// Do order
const doOrder = async (req,res)=>{
    try{
        const userName = await User.findById({_id:req.session.user_id});
        const cartData = await Cart.findOne({userName:req.session.user_id});
        const Total = parseInt(req.body.amount);      
        const products = cartData.products;
        //order ID genarating
        var orderedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        var uniqueId = Math.floor(Math.random() * 1115500).toString().padStart(3, '0');
        var order_Id =  orderedDate + '-' + uniqueId;
        //
        const paymentMethod = req.body.payment_method;
        const totalPrice = parseInt(req.body.amount);
        const discount = parseInt(req.body.discountAmount);

        const wallet = totalPrice - Total - discount;
        const status = paymentMethod === "COD" ? "placed" : "pending";
        const order = new Order({

            order_Id:order_Id,
            userAddress: req.body.userAddress, 
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
                await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});

                await Order.updateOne({_id:orderId},{$set:{month:date}})
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

    const crypto = require('crypto');

    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
    hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
    hmac = hmac.digest('hex');
    if(hmac==details['payment[razorpay_signature]']){
      //await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
        await Order.findByIdAndUpdate(details['order.receipt'],{$set:{status:"placed"}});
        await Order.findByIdAndUpdate(details['order[receipt]'],{$set:{paymentId:details['payment[razorpay_payment_id]']}});
        await Cart.deleteOne({userName:req.session.user_id});
        return res.json({success:true});
    }else{
        await Order.findByIdAndRemove(details['order.receipt']);
        return res.json({success:false});
    }
    
  }catch(error){
      console.log(error.message);
  }
}

// admin place order
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
      console.log("error while loading");
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
      console.log("error while loading");
    }
  }
  
  // user cancel Orders
  const cancelOrders = async (req,res)=>{
    try {
      const id = req.query.id;
      const user = req.session.user_id; 
      const orderData = await Order.findById(id);
      const orderid = orderData._id;
      const userData = await User.findById({_id:user});
      const products = orderData.products;
      const userWallet = userData.wallet;

      if(orderData.status == "placed" || orderData.status == "delivered"){
          if(orderData.paymentMethod == "onlinePayment"){

              const totalWallet = orderData.Amount+userWallet
              console.log(totalWallet);
              await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
              await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"cancelled"}});
              for (let i = 0; i < products.length; i++) { // Updating product count in DB
                const pro = products[i].productId;
                const count = Number(products[i].count)
                await Product.findByIdAndUpdate({ _id: pro }, { $inc: { productQuantity: +count } }); 
              }
              res.redirect("/account");

            }else{
              const totalWallet = userWallet+orderData.orderWallet;

              await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"cancelled"}});
              await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
              for (let i = 0; i < products.length; i++) { // Updating product count in DB
                const pro = products[i].productId;
                const count = Number(products[i].count)
                await Product.findByIdAndUpdate({ _id: pro }, { $inc: { productQuantity: +count } }); 
              }
              res.redirect("/account");
            }
      }else{
          await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
          for (let i = 0; i < products.length; i++) { // Updating product count in DB
            const pro = products[i].productId;
            const count = Number(products[i].count)
            await Product.findByIdAndUpdate({ _id: pro }, { $inc: { productQuantity: +count } }); 
          }
          res.redirect("/account");
      }
    } catch (error) {
      console.log("error while loading cancle");
    }
  }



module.exports = {
    doOrder,
    verifyPayment,
    placedOrder,
    orderDeliverd,
    cancelOrders,
}