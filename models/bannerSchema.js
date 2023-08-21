const mongoose = require('mongoose')

const bannerSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    banner:{
        type:String,
        required:true
    },
    category:mongoose.Types.ObjectId
})

const banners=new mongoose.model('banners',bannerSchema)
module.exports=banners