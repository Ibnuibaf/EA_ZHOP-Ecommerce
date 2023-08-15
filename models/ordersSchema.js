const mongoose = require('mongoose')
const { Date } = require('mongoose/lib/schema/index')

const orderSchema = new mongoose.Schema({
    prd_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    date: {
        type: Date
    },
    address: {
        locality: String,
        country: String,
        district: String,
        state: String,
        city: String,
        altr_number: Number,
        postcode: Number
    },
    status: {
        type: String,
        default: "delivery-period"
    },
    returned: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        required: true
    },
    consumer: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    mobile_number:{
        type:Number,
        required:true
    },
    payment: {
        type: String,
        required: true
    },
    refunded: {
        type: Boolean,
        default: false
    },
    qty: {
        type: Number,
        required: true
    }
})

const orders=new mongoose.model('order',orderSchema)
module.exports=orders