
const User = require('../models/userModel');
const Coupon = require('../models/couponModel');
const { findByIdAndUpdate } = require('../models/orderModel');
//-------------------------------------------------------------
const ITEMS_PER_PAGE = 10;


// Admin add new Coupon
const addCoupon = async (req,res)=>{
    try {
        const admin = req.session.admin_id;
        res.render('./admin/addCoupon',{admin:admin});
    } catch (error) {
        console.error('Error occurred while loading add coupon page:', error);
        res.status(500).send('Error occurred while loading add couponpage.');
    }
}

// View Coupon List
const viewCouponList = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    let { search, status, page, itemsPerPage } = req.query;
    page = parseInt(page) || 1;
    itemsPerPage = parseInt(itemsPerPage) || ITEMS_PER_PAGE;

    const query = {};

    if (search) {
      query.code = { $regex: new RegExp(search, 'i') };
    }

    if (status) {
      query.status = status === 'active' ? true : false;
    }

    const totalCoupons = await Coupon.countDocuments(query);
    const totalPages = Math.ceil(totalCoupons / itemsPerPage);

    const coupons = await Coupon.find(query)
      .sort({ startDate: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    res.render('./admin/viewCouponList', {
      admin,
      coupon: coupons,
      search,
      status,
      currentPage: page,
      totalPages,
      ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error('Error occurred while loading view list coupon page:', error);
    res.status(500).send('Error occurred while loading view list couponpage.');
  }
};

// Post Add Coupon
const postAddCoupon = async(req,res)=>{
    try{ 
        
        const { code, discountType, startDate, expiryDate, discountAmount, maxCartAmount, maxDiscountAmount, maxUsers} = req.body;
        const coupon = new Coupon({
            code,
            discountType,
            startDate,
            expiryDate,
            discountAmount,
            maxCartAmount,
            maxDiscountAmount,
            maxUsers,
        })
        const couponData = await coupon.save();
        if(couponData){
            res.redirect('/admin/viewCouponList');
        }else{
            res.redirect('/admin/viewCouponList');
        }
    }catch(error){
        console.log(error.message);
        console.error('Error occurred while loading post coupon page:', error);
        res.status(500).send('Error occurred while loading post coupon page.');
    }
}


// Apply coupon user 
const applyCoupon = async(req,res)=>{
    try{
        const code = req.body.code;          
        const amount = Number(req.body.amount);
        const userExist = await Coupon.findOne({code:code,user:{$in:[req.session.user_id]}});
        if(userExist){
            res.json({user:true});
        }else{
            const couponData = await Coupon.findOne({code:code});
            if(couponData){
                if(couponData.maxUsers<=0){
                    res.json({limit:true});
                }else{
                    if(couponData.status == false){
                        res.json({status:true})
                    }else{
                        if(couponData.expiryDate<=new Date()){
                            res.json({date:true});
                        }else{
                            if(couponData.maxCartAmount >= amount){
                                res.json({cartAmount:true});
                            }else{

                                await Coupon.findByIdAndUpdate({_id:couponData._id},{$push:{user:req.session.user_id}});
                                await Coupon.findByIdAndUpdate({_id:couponData._id},{$inc:{maxUsers:-1}});
                                if(couponData.discountType == "Fixed Amount"){
                                    const disAmount = couponData.discountAmount;
                                    const disTotal = Math.round(amount - disAmount);
                                    return res.json({amountOkey:true,disAmount,disTotal});

                                }else if(couponData.discountType == "Percentage Type"){
                                    const perAmount = (amount * couponData.discountAmount)/100;
                                    if(perAmount <= couponData.maxDiscountAmount){
                                        const disAmount = perAmount;
                                        const disTotal = Math.round(amount-disAmount);
                                        return res.json({amountOkey:true,disAmount,disTotal});
                                    }
                                }else{
                                    const disAmount = couponData.maxDiscountAmount;
                                    const disTotal = Math.round(amount-disAmount);
                                    return res.json({amountOkey:true,disAmount,disTotal});
                                }
                            }
                        }
                    }
                }
            }else{
                res.json({invalid:true});
            }
        }
    }catch(error){
        console.log(error.message);
        console.error('Error occurred while loading apply coupon page:', error);
        res.status(500).send('Error occurred while loading apply coupon page.');
    }
}


// Load edit coupon
const loadEditCoupon = async (req, res)=>{
    try {
        const admin = req.session.admin_id;
        const couponId = req.params.couponId;
        const couponData = await Coupon.findById({_id:couponId});
        res.render('./admin/editCoupon',{admin:admin, coupon:couponData});
    } catch (error) {
        console.error('Error occurred while loading edit coupon page:', error);
        res.status(500).send('Error occurred while loading edit coupon page.');
    }
}

// edit coupon
const editCoupon = async (req,res)=>{
    try{
        console.log(req.body);
        const couponId = req.params.couponId;

        const coupon = await Coupon.findByIdAndUpdate({_id:couponId},{
            code:req.body.code,
            discountType:req.body.discountType,
            discountAmount:req.body.amount,
            expiryDate:req.body.date,
            maxCartAmount:req.body.cartAmount,
            maxDiscountAmount:req.body.discountAmount,
            maxUsers:req.body.couponCount
        })
        await coupon.save();
        res.redirect('/admin/viewCouponList');
    }catch(error){
        console.log(error.message);
        console.error('Error occurred while loading post edit coupon page:', error);
        res.status(500).send('Error occurred while loading post edit coupon page.');
    }
}

// delete coupon
const deleteCoupon = async (req,res)=>{
    try{
        const couponId = req.params.couponId;
        console.log(couponId)
        await Coupon.deleteOne({_id:couponId});
        res.redirect('/admin/viewCouponList');
    }catch(error){
        console.log(error.message);
    }
}


module.exports = {
    addCoupon,
    viewCouponList,
    postAddCoupon,
    applyCoupon,
    loadEditCoupon,
    editCoupon,
    deleteCoupon
    
}