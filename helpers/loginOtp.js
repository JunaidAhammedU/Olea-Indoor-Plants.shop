const nodemailer = require("nodemailer");
require("dotenv").config();

//--------------------------------------------


// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
});



let Lotp = "";
const sendLoginOTPEmail = async (email) => {
  try {
    Lotp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Olea Forget OTP Verification",
      text: `Your OTP is ${Lotp}. Please enter this OTP to verify your account.`,
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent to user : " + Lotp);
  } catch (error) {
    console.log("Error sending OTP verification email:", error.message);
  }
  return obj = {Lotp:Lotp,email:email};
};


module.exports = {
    sendLoginOTPEmail
}