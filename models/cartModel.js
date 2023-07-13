const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userName: {
    type: ObjectId, 
    ref: "User",
    required: true
  },
  user: {
    type: String,
    required: true
  },
  products: [{
    productId: {
      type: ObjectId,
      ref: "Product",
      required: true
    },
    count: {
      type: Number,
      default: 1
    }, 
    productPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      default: 0
    }
  }]
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
