const { ObjectId, Decimal128, Double, Long } = require('mongodb')
const mongoose=require('mongoose')
const { ObjectID } = require('mongoose/lib/schema/index')
const decimal128 = require('mongoose/lib/types/decimal128')

const usersSchema=new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    mobile_number:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:[{
            locality:String,
            country:String,
            city:String,
            altr_number:Number,
            postcode:Number
        }]
    },
    wallet:{
        type:{
            balance:{
                type:decimal128,
                default:0.0
            },
            transactions:[String]
        },
        required:true
    },
    cart:[{ prd_id:ObjectId, qty:Number}],
    wishlist:[ObjectID],
    orders:[ObjectID],
    blocked:{
        type:Boolean,
        default:false
    }
})



const usersCollection=new mongoose.model("users",usersSchema)

module.exports=usersCollection