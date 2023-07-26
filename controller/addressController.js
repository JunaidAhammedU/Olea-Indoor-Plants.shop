
const Address = require('../models/addressModel');
const User = require('../models/userModel');


const loadAddressPage = async (req,res)=>{
    try {
        if (req.session.user_id) {
            res.render('./user/addAddress');
        }else{
            res.redirect('/cart');
        }
    } catch (error) {
        console.log("error");
    }
}

// add Address
const addAddress = async (req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id});
        const addressDetails = await Address.findOne({userId:req.session.user_id});
        if(addressDetails){
            const updatedOne = await Address.updateOne({userId:req.session.user_id},
                {$push:
                {addresses:{
                Fullname:req.body.Fullname,
                email:req.body.email,
                phone:req.body.phone,
                alternativeMob:req.body.alternativeMob,
                House_number_and_street:req.body.House_number_and_street,
                Apartment:req.body.Apartment,
                City:req.body.City,
                State:req.body.State,
                Zip:req.body.Zip,
                oderMessage:req.body.oderMessage,
            }}});
                if(updatedOne){
                    res.redirect('/checkout');
                }else{
                    res.redirect('/checkout');
                }
        }else{
            const address = new Address({
                userId:userData._id,
                addresses:[{
                    Fullname:req.body.Fullname,
                    email:req.body.email,
                    phone:req.body.phone,
                    alternativeMob:req.body.alternativeMob,
                    House_number_and_street:req.body.House_number_and_street,
                    Apartment:req.body.Apartment,
                    City:req.body.City,
                    State:req.body.State,
                    Zip:req.body.Zip,
                    oderMessage:req.body.oderMessage,
                }]
            });
            const addressData = await address.save();
            if(addressData){
                res.redirect('/checkout')
                console.log("address added!");
            }else{
                res.redirect('/checkout');
            }
        }
    } catch (error) {
        console.log(error);

    }
}



module.exports = {
    loadAddressPage,
    addAddress,
}