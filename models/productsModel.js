  const mongoose = require("mongoose");

  var productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    }, 
    category:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Categories',
      required:true,
    },   
    productQuantity: { 
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  // Export the model
  module.exports = mongoose.model("Product", productSchema);


