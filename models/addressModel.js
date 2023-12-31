const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true
    },  
    addresses:[{
        Fullname:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        phone:{
            type:Number,
            required:true
        },
        alternativeMob:{
            type:Number,
            required:true
        },
        House_number_and_street:{
            type:String,
            required:true
        },
        Apartment:{
            type:String,
            required:true
        },
        City:{
            type:String,
            required:true
        },
        State:{
            type:String,
            required:true
        },
        Zip:{
            type:Number,
            required:true
        },
        oderMessage:{
            type:String,
        }
    }]
})

const addressModel = mongoose.model("address",addressSchema);
module.exports = addressModel;