const mongoose = require("mongoose");

const userVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 10 * 60 * 1000);
    },
  },
  fortgetOtp:{
    type:String,
  }
});

const UserVerification = mongoose.model(
  "UserVerification",
  userVerificationSchema
);

module.exports = UserVerification;
