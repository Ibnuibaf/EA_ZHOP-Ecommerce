const mongoose=require('mongoose')
const { Date } = require('mongoose/lib/schema/index')

const orderSchema=new mongoose.Schema({
    prd_id:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    date:{
        type:Date
    },
    status:{
        type:String,
        default:"delivery-period"
    },
    returned:{
        type:Boolean,
        default:false
    },
    amount:{
        type:Number,
        required:true
    },
    consumer:{
        type:String,
        required:true
    },
    payment:{
        type:String,
        required:true
    },
    refunded:{
        type:Boolean,
        default:false
    },
    qty:{
        type:Number,
        required:true
    }
})