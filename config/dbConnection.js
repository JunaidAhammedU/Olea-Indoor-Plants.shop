const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const connect = mongoose.connect(process.env.DB_URI);
    console.log("DB connected");
  } catch (error) {
    console.log("DB not connected");
  }
};

module.exports = dbConnect;
