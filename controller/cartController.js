const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Product = require('../models/productsModel');
const Address = require('..//models/addressModel');
const ProductOffer = require("../models/productOfferModel")
const Offer = require("../models/categorieOfferModel");
const Coupon = require("../models/couponModel");
const Category = require("../models/categoriesModel")
//-----------------------------------------------------



// load cart page
const loadCartPage = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userName = await User.findOne({ _id: userId });
    // const cartData = await Cart.findOne({ userName: userId })
    //   .populate({path: "products.productId", select: "name images price" }).exec();
    
    const cartData = await Cart.findOne({ userName: userId })
      .populate({ path: "products.productId", select: "name images price" }).exec();
      console.log(cartData)
      
      const categoryOffer = await Offer.find({ status: 'Active' }).populate('category');
      const productOffer = await ProductOffer.find({status:'Active'})
      const category = await Category.find({status:true});

      if (cartData.products.length > 0) {
        const products = cartData.products;
        let totalPriceUpdate = 0;
        for(const item of products){
          const productId = item.productId._id;
          const proData = await Product.findOne({_id:productId});
          const quantity = item.count;
          const proOfferMatch = productOffer.find((x) => x.productName.equals(productId));
          const offerMatch = categoryOffer.find((x) => x.category._id.equals(proData.category));
          if(proOfferMatch && offerMatch){
            const offerPrice = proData.price - ((proData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage))/100);
            totalPriceUpdate += quantity * offerPrice;
          }else if(proOfferMatch && !offerMatch){
            const offerPrice = proData.price - ((proData.price * proOfferMatch.discountPercentage)/100);
            totalPriceUpdate += quantity * offerPrice;
          }else if(offerMatch && !proOfferMatch){
            const offerPrice = proData.price - ((proData.price * offerMatch.discountPercentage )/100);
            totalPriceUpdate += quantity * offerPrice;
          }else{
            totalPriceUpdate += quantity * proData.price;
          }
         }

        const total = await Cart.aggregate([
          { $match: { user: userName.name } },
          { $unwind: "$products" },
          {
            $project: {
              productPrice: "$products.productPrice",
              cou: "$products.count",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$productPrice", "$count"] } },
            },
          },
        ]);

        const Total = total[0].total;
        const userId = userName._id;
        let customer = true;
        
        res.render("./user/cart", { customer, userName, products, Total, userId ,category, categoryOffer, productOffer, totalPriceUpdate,cartData});
    } else {
      res.render('./user/cartEmpty', {
        customer: true,
        userName,
        message: "No products added to cart"
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};


// add to cart
const addToCart = async (req, res) => {
  try {
    const productId =  req.body.query;
    const userData = await User.findOne({ _id: req.session.user_id});
    const productData = await Product.findOne({ _id: productId });
    const user = req.session.user_id

    if (user) {
      const userId = req.session.user_id;
      const cartData = await Cart.findOne({ userName: userId });
      
    if(productData.productQuantity > 0){

      if (cartData) {
        const productExist = cartData.products.findIndex(
          (product) => product.productId.toString() === productId
        );
        
        if (productExist !== -1) { 
          await Cart.updateOne(
            { userName: userId, 'products.productId': productId },
            { $inc: { 'products.$.count': 1 } }
          );

        } else {
          await Cart.findOneAndUpdate(
            { userName: req.session.user_id },
            {
              $push: {
                products: {
                  productId: productId,
                  productPrice: productData.price
                }
              }
            }
          );
        }
      } else {
        const cart = new Cart({
          userName: userData._id,
          user: userData.name,
          products: [
            {
              productId: productId,
              productPrice: productData.price
            }
          ]
        });
        await cart.save(); 
      }
      res.json({success:true})
    }else {
      res.json({stockOut: true});
    }
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.send('Error while adding to cart!');
  }
};

//remove Products from the cart
const removeProduct = async (req, res) => {
  try {
    const user = req.session.user_id;
    const id = req.query.id;
    await Cart.updateOne({ userName: user }, { $pull: { products: { productId: id } } });
    res.redirect('/cart');
  } catch (error) {
    console.log(error.message);
  }
};

//===================================================================================
// // change product quantity
// const changeProductQuantity = async (req, res) => {
//   try {
//     const userId = req.body.user;
//     const proId = req.body.product;
//     let count = req.body.count;
//     count = parseInt(count);

//     const cartData = await Cart.findOne({ userName: userId });
//     const [{ count: quantity }] = cartData.products;

//     const productData = await Product.findOne({ _id: proId });
//     if (productData.stockQuantity < quantity + count) {
//       res.json({ check: true });
//     } else {
//       await Cart.updateOne({ userName: userId, "products.productId": proId }, 
//       { $inc: { "products.$.count": count } });
//       res.json({ success: true });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };
//===================================================================================
// change product quantity
const changeProductQuantity = async (req, res) => {
  try {
    
    const cartId = req.body.cart;
    const proId = req.body.product;
    let count = req.body.count;
    let quantity = req.body.quantity;
    count = parseInt(count);
    quantity = parseInt(quantity);

    const productData = await Product.findById({_id:proId})
      
    if (count == -1 && quantity == 1) {
      await Cart.
      updateOne({ _id: cartId },
        {
           $pull: { products:{ productId:proId }} 
        }
      );
      res.json({removeProduct:true})
    } else {
        await Cart.updateOne(
          { _id: cartId, 'products.productId': proId },
          { $inc: { 'products.$.count': count } }
        );
        res.json(true);
    }
  } catch (error) {
    console.log(error.message);
  }
};


// load chechout
const loadCheckout = async(req,res)=>{
  try{
      const userId = req.session.user_id
      const userName = await User.findOne({_id:req.session.user_id});
      const addressData = await Address.findOne({userId:req.session.user_id});
      const coupons = await Coupon.find();
      const cartData = await Cart.findOne({
        userName: req.session.user_id,
      }).populate("products.productId");

      const categoryOffer = await Offer.find({status:'Active'}).populate('category');
      const productOffer = await ProductOffer.find({status:'Active'}); 
      const category = await Category.find({status:true});

      if(req.session.user_id){
          if(addressData){
              if(addressData.addresses.length>0){
                  const address = addressData.addresses;
                  const products = cartData.products;

                  let totalPriceUpdate = 0;
                  for(const item of products){
                    const productId = item.productId._id;
                    const proData = await Product.findOne({_id:productId});
                    const quantity = item.count;
                  
                    const proOfferMatch = productOffer.find((x) => x.productName.equals(productId));
                    const offerMatch = categoryOffer.find((x) => x.category._id.equals(proData.category));
                    if(proOfferMatch && offerMatch){
                      const offerPrice = proData.price - ((proData.price * (offerMatch.discountPercentage + proOfferMatch.discountPercentage))/100);
                      totalPriceUpdate += quantity * offerPrice;
                    }else if(proOfferMatch && !offerMatch){
                      const offerPrice = proData.price - ((proData.price * proOfferMatch.discountPercentage)/100);
                      totalPriceUpdate += quantity * offerPrice;
                    }else if(offerMatch && !proOfferMatch){
                      const offerPrice = proData.price - ((proData.price * offerMatch.discountPercentage )/100);
                      totalPriceUpdate += quantity * offerPrice;
                    }else{
                      totalPriceUpdate += quantity * proData.price;
                    } 
                  }
                  // -----------------------
                    
                  const total = await Cart.aggregate([{$match:{user:userName.name}},
                    {$unwind:"$products"},
                    {$project:{productPrice:"$products.productPrice",count:"$products.count"}},
                    {$group:{_id:null,total:{$sum:{$multiply:["$productPrice","$count"]}}}}]);

                  if(total[0].total >= userName.wallet){
                      const Total = total[0].total
                      const grandTotal = (total[0].total) - userName.wallet ;
                      let customer = true;
                      res.render('./user/checkout',{customer,userName,address,Total,grandTotal,addressData,totalPriceUpdate,coupons,userId});
                  }else{
                      const Total = total[0].total;
                      const grandTotal = 1;
                      let customer = true;
                      res.render('./user/checkout',{customer,userName,address,Total,grandTotal,addressData,totalPriceUpdate,coupons,userId});
                  }
              }else{
                  let customer = true;
                  res.render('./user/addAddress',{customer,userName,message:"Add your delivery address"});
              }
          }else{
              let customer = true;
              res.render('./user/addAddress',{customer,userName,message:"Add your delivery address"});
          }
      }else{
          res.redirect('/');
      }
  }catch(error){
      console.log(error.message);
  }
}

module.exports = {  
  loadCartPage,
  addToCart,
  changeProductQuantity,
  loadCheckout,
  removeProduct
};