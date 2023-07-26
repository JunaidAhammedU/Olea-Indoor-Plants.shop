const Wishlist = require('../models/wishListModel');
const Product = require('../models/productsModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const { ObjectId } = require('mongodb');
//------------------------------------------------------


// Add to wishlist
const addToWishlist = async(req,res)=>{
    try{
        const proId = req.body.query;
        const user = await User.findOne({_id:req.session.user_id})
        const productData = await Product.findOne({_id:proId});
        const wishlistData = await Wishlist.findOne({user:req.session.user_id});

        if(wishlistData){
            const checkWishlist = await wishlistData.products.findIndex((wish)=> wish.productId == proId);
            if(checkWishlist != -1){
                res.json({check:true})
            }else{
                await Wishlist.updateOne({user:req.session.user_id},{$push:{products:{productId:proId}}});
                res.json({success:true});
            }
        }else{
            const wishlist = new Wishlist({
                user:req.session.user_id,
                userName:user.name,
                products:[{
                    productId:productData._id
                }]
            })

            const wish = await wishlist.save();
            if(wish){
                res.json({success:true});
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

// load wishlist page
const loadWishlist = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        const wishlistData = await Wishlist.findOne({user:req.session.user_id}).populate("products.productId");
        const products = wishlistData.products;
        if(products.length>0){
            if(req.session.user_id){ 
                const customer = true;
                res.render('./user/wishlist',{customer,userName,products});
            }else{
                res.redirect('/');
            }
        }else{
            const customer = false;
            res.render('./user/emptyWishlist',{userName,customer,message:"No product added to wishlist"});
        }
    }catch(error){
        console.log(error.message);
    }
}

// remove from wishlist
const removeWishlist = async (req,res)=>{
    try{
        const id = req.params.id;
        await Wishlist.updateOne({user:req.session.user_id},{$pull:{products:{productId:id}}});
        res.redirect('/wishlist');
    }catch(error){
        console.log(error.message);
    }
}

// add to cart from wishlist
const addFromWish = async (req,res)=>{
    try{
        const productId = req.params.id;
        const userData = await User.findOne({_id:req.session.user_id});
        const productData = await Product.findOne({_id:productId});
        if(req.session.user_id){
            const userid = req.session.user_id;
            const cartData = await Cart.findOne({userName:userid});
            if(cartData){
                const productExist = await cartData.products.findIndex((product)=>
                    product.productId == productId
                )
                if(productExist != -1){
                    await Cart.updateOne({userName:userid,"products.productId":productId},{$inc:{"products.$.count":1}});
                    await Wishlist.updateOne({user:userid},{$pull:{products:{productId:productId}}});
                    // res.json({success:true})
                    res.redirect('/cart');

                }else{
                    await Cart.findOneAndUpdate({userName:req.session.user_id},{$push:{products:{productId:productId,productPrice:productData.price}}});
                    await Wishlist.updateOne({user:userid},{$pull:{products:{productId:productId}}});
                    // res.json({success:true})
                    res.redirect('/cart');
                }
            }else{
                const cart = new Cart({
                    userName:userData._id,
                    user:userData.name,
                    products:[{
                        productId:productId,
                        productPrice:productData.price
                    }]
                });

                const cartData = await cart.save();
                if(cartData){
                    await Wishlist.updateOne({user:userid},{$pull:{products:{productId:productId}}});
                    res.redirect('/cart');                   
                }else{
                    res.redirect('/');
                }  
            }
        }else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error.message);
    }
}





module.exports = {
    addToWishlist,
    loadWishlist,
    removeWishlist,
    addFromWish
}