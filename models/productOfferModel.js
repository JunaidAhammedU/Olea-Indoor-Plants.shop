const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productOfferSchema = new mongoose.Schema({
    productName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    discountPercentage:{
        type:Number,
        required:true,
    },
    startDate:{
        type:Date,
        required:true,
    },
    endDate:{
        type:Date,
        required:true,
    },
    status:{
        type:String,
        default:"Active",
    }
});

productOfferSchema.pre('save', function(next){
    const currentDate = new Date();
    if(this.endtDate <= currentDate){
        this.status = 'Expired'
    }
    next();
});

//Export the model
module.exports = mongoose.model('ProductOffer', productOfferSchema);