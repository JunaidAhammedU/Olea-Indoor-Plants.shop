const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Product = require('../models/productsModel');
const Address = require('..//models/addressModel');
//-----------------------------------------------------



// load cart page
const loadCartPage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userName = await User.findOne({ _id: userId });
    const cartData = await Cart.findOne({ userName: userId })
      .populate({
        path: "products.productId",
        select: "name images price"
      })
      .exec();

    if (userId && cartData && cartData.products.length > 0) {
      const products = cartData.products;
      let Total = 0;
      products.forEach((product) => {
        const productPrice = product.productId.price;
        const count = product.count;
        Total += productPrice * count;
      });

      res.render('./user/cart', {
        customer: true,
        userName,
        products,
        Total,
        userId
      });
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
    const productId = req.params.productId;
    const userData = await User.findOne({ _id: req.session.user_id});
    const productData = await Product.findOne({ _id: productId });

    if (req.session.user_id) {
      const userId = req.session.user_id;
      const cartData = await Cart.findOne({ userName: userId });

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

      res.redirect('/cart');
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

// change product quantity
const changeProductQuantity = async (req, res) => {
  try {
    const userId = req.body.user;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);

    const cartData = await Cart.findOne({ userName: userId });
    const [{ count: quantity }] = cartData.products;

    const productData = await Product.findOne({ _id: proId });
    if (productData.stockQuantity < quantity + count) {
      res.json({ check: true });
    } else {
      await Cart.updateOne({ userName: userId, "products.productId": proId }, 
      { $inc: { "products.$.count": count } });
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};



// load chechout
const loadCheckout = async(req,res)=>{
  try{
      const userName = await User.findOne({_id:req.session.user_id});
      const addressData = await Address.findOne({userId:req.session.user_id});
      if(req.session.user_id){
          if(addressData){
              if(addressData.addresses.length>0){
                  const address = addressData.addresses;
                  const total = await Cart.aggregate([{$match:{user:userName.name}},
                    {$unwind:"$products"},
                    {$project:{productPrice:"$products.productPrice",count:"$products.count"}},
                    {$group:{_id:null,total:{$sum:{$multiply:["$productPrice","$count"]}}}}]);

                  if(total[0].total>= userName.wallet){
                      const Total = total[0].total
                      const grandTotal = (total[0].total) - userName.wallet ;
                      let customer = true;
                      res.render('./user/checkout',{customer,userName,address,Total,grandTotal,addressData});
                  }else{
                      const Total = total[0].total;
                      const grandTotal = 1;   
                      let customer = true;
                      res.render('./user/checkout',{customer,userName,address,Total,grandTotal,addressData});
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
