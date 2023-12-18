const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const connect = mongoose.connect("mongodb+srv://junaidfive268:Junaid3337@cluster0.dzacll6.mongodb.net/?retryWrites=true&w=majority");
    console.log("DB connected");
  } catch (error) {
    console.log("DB not connected");
  }
};

module.exports = dbConnect;
