const { ObjectId, Decimal128, Double, Long } = require('mongodb')
const mongoose = require('mongoose')
const { ObjectID } = require('mongoose/lib/schema/index')
const decimal128 = require('mongoose/lib/types/decimal128')

const usersSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    mobile_number: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: [{
            locality: String,
            country: String,
            district: String,
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
    cart: [mongoose.Types.ObjectId],
    wishlist: [mongoose.Types.ObjectId],
    orders: [mongoose.Types.ObjectId],
    blocked: {
        type: Boolean,
        default: false
    }
}, {
    suppressWarning: true // Set suppressWarning option to true
})



const usersCollection = new mongoose.model("users", usersSchema)

module.exports = usersCollection