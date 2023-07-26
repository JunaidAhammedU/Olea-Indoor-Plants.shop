const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var categoryOfferSchema = new mongoose.Schema({
    
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Categories',
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

categoryOfferSchema.pre('save', function(next){
    const currentDate = new Date();
    if(this.endtDate <= currentDate){
        this.status = 'Expired'
    }
    next();
});

//Export the model
module.exports = mongoose.model('categoryOffer', categoryOfferSchema);