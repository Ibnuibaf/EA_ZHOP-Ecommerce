const { ObjectId, Decimal128, Double, Long } = require('mongodb')
const mongoose = require('mongoose')
const { ObjectID } = require('mongoose/lib/schema/index')
const decimal128 = require('mongoose/lib/types/decimal128')

const usersSchema = new mongoose.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    mobile_number: {
        type: Number
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    address: {
        type: [{
            locality: String,
            country: String,
            district: String,
            state:String,
            city: String,
            altr_number: Number,
            postcode: Number
        }]
    },
    wallet: {

        balance: {
            type: decimal128,
            default: 0.0
        },
        transactions: [String]

    },
    cart: [{
        prd_id:mongoose.Types.ObjectId,
        qty:{
            type:Number,
            default:1
        },
        unit_prize:{
            type:Number
        },
        total_prize:{
            type:Number
        },

    }],
    wishlist: [mongoose.Types.ObjectId],
    orders: [mongoose.Types.ObjectId],
    blocked: {
        type: Boolean,
        default: false
    }
}, {
    suppressWarning: true 
})



const usersCollection = new mongoose.model("users", usersSchema)

module.exports = usersCollection