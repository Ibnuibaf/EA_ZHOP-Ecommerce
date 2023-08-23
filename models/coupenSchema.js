const mongoose=require('mongoose')

const coupenSchema=new mongoose.Schema({
    coupon_code:{
        type:String,
        required:true
    },
    value:{
        type:Number,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    hit_amount:{
        type:Number,
        default:0
    },
    start_date:{
        type:Date
    },
    end_date:{
        type:Date
    },
    active:{
        type:Boolean,
        default:true
    }
})

const coupen=new mongoose.model("coupens",coupenSchema)
module.exports=coupen