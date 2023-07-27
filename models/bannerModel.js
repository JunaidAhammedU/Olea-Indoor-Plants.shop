const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var bannerSchema = new mongoose.Schema({
    
    bannerTitle:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    images: {
        type: String,
        required: true,
    }
});

//Export the model
module.exports = mongoose.model('Banner', bannerSchema);