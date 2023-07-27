const categoryOffer = require('../models/categorieOfferModel');
const ProductOffer = require('../models/productOfferModel');
const Category = require('../models/categoriesModel');
const Product = require('../models/productsModel');
//------------------------------------------------------------

//? category offer
const loadCategoryOfferList = async(req,res)=>{
  try {
    const admin = req.session.admin_id; 
    const cateOffers = await categoryOffer.find().populate('category');
     res.render('./admin/listCategoryOffer',{admin:admin, cateOffers});
  } catch (error) {
    console.log(error.message);
  }
}

// load product offer
const addCategoryOffer = async (req,res)=>{
    try {
      const admin = req.session.admin_id;
      const catData = await Category.find();
      res.render("./admin/addCategoryOffer",{admin: admin , catData: catData});
    } catch (error) {
      console.error('Error occurred while loading Category offer page:', error);
      res.status(500).send('Error occurred while loading  Category offer page.');
    }
}

// add offer category
const getCategoryOffer = async(req,res)=>{
  try {
    const data = new categoryOffer ({
      category:req.body.category,
      description:req.body.description,
      discountPercentage:req.body.discountPercentage,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
    });

    const newOffer = await data.save();
    if (newOffer) {
      res.json({status : true});
    }else{
      res.json({status : false});
    }

  } catch (error) {
    console.log(error.message);
  }   
}

// edit category offer
// const editCategoryOffer = async(req,res)=>{
//   try {
//     const offerId = req.params.offerId;

//     const data = await ProductOffer.findOne({_id:offerId}).populate('category');
//     console.log(data);
//     const categories = await Category.find({status:true});
//     res.render('editCategoryOffer',{data,categories});

//   } catch (error) {
//     console.log(error.message);
//   }
// }

// const updateCategoryOffer = async(req,res)=>{
//   try {
//     const offerId = req.body.id;
//     const data = {
//       title:req.body.title,
//       description:req.body.description,
//       category:req.body.category,
//       discountPercentage:req.body.discountPercentage,
//       startDate:req.body.startDate,
//       endDate:req.body.endDate,
//     };
//     if (!data.title || !data.description || !data.category || !data.discountPercentage || !data.startDate || !data.endDate){
//       return res.json({ error: 'Fill in all fields!' });
//     }

//     const currentDate = new Date();
//     const startDate = new Date(data.startDate);
//     const endDate = new Date(data.endDate);
//     if (startDate < endDate && endDate >= currentDate){
//       data.status = "Active";
//     } else if (endDate <= currentDate){
//       data.status = "Expired";
//     } else if (startDate > endDate){
//       return res.json({ error: "Starting date is wrong!"});
//     }

//     await ProductOffer.updateOne({_id:offerId},data);
//     res.json({success: 'sucess'});

//   } catch (error) {
//     console.log(error.message);
//   }
// }

//================================================================================================//

//? product offer
const loadProductOfferList = async(req,res)=>{
  try {
    const admin = req.session.admin_id; 
    const productOffers = await ProductOffer.find().populate('productName');
     res.render('./admin/listProductOffer',{admin:admin, productOffers});
  } catch (error) {
    console.log(error.message);
  }
}

// load product offer
const addProductOffer = async (req, res) => {
    try {
      const admin = req.session.admin_id;
      const productData = await Product.find();
      res.render("./admin/addProductOffer", { admin: admin, productData: productData });
    } catch (error) {
      console.error('Error occurred while loading  product offer page:', error);
      res.status(500).send('Error occurred while loading  addProduct offer page.');
    }
  };

// get Product Offer
const getProductOffer = async(req,res)=>{
  try {
    console.log(req.body)
    const data = new ProductOffer ({
      productName:req.body.productName,
      description:req.body.description,
      discountPercentage:req.body.discountPercentage,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
    })
    const newOffer = await data.save();
    if (newOffer) {
      res.json({status : true});
    }else{
      res.json({status : false});
    }
  } catch (error) {
    console.log(error.message);
  }
}

//edit Product Offer
const editProductOffer = async(req,res)=>{
  try {
    const admin = req.session.admin_id;
    const offerId = req.params.offerId;
    const data = await ProductOffer.findOne({_id:offerId}).populate('productName');
    const productData = await Product.find({status:true});
    res.render('./admin/editProductOffer',{admin:admin, data, productData:productData});
  } catch (error) {
    console.log(error.message);
  }
}

// updating product offer
const updateProductOffer = async(req,res)=>{
  try {
    const offerId = req.body.id
    const data = {
      productName:req.body.productName,
      description:req.body.description,
      discountPercentage:req.body.discountPercentage,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
    }
    if(!data.productName || !data.description || !data.discountPercentage || !data.startDate || !data.endDate){
      return res.json({noValidation: true });
    }

    const currentDate = new Date();
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if(startDate<endDate && endDate >= currentDate ){
      data.status = "Active";
    } else if (endDate <= currentDate){
      data.status = "Expired";
    } else if (startDate > endDate) {
      return res.json({dateWrong: true});
    }
    await ProductOffer.updateOne({_id:offerId},data);
    return res.json({success:true});
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadProductOfferList,
  addProductOffer,
  loadCategoryOfferList,
  getProductOffer,
  editProductOffer,
  updateProductOffer,
  addCategoryOffer,
  getCategoryOffer,
//   editCategoryOffer,
//   updateCategoryOffer,
}