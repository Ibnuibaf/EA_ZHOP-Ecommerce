const mongoose=require('mongoose')

const otpVerification=new mongoose.Schema({
    user:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date,
})
const OTPverify=mongoose.model("otpVerification",otpVerification)

module.exports=OTPverify