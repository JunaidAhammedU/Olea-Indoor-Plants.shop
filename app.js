const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./config/dbConnection");
const userRouter = require("./routes/userRouter");
const nocache = require("nocache");
const adminRoute = require("./routes/adminRoute");
const fileUpload = require("express-fileupload");
const multer = require("multer");
require("dotenv").config();
//--------------------------------------------------


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views/user"));
app.use(express.static("public"));
app.use( express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());

//database connection
dbConnect();

app.use("/", userRouter);
app.use("/admin", adminRoute);

//server
app.listen(process.env.PORT, () => {
  console.log("running...");
});
