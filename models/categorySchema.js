const mongoose=require('mongoose')

const categorySchema=new mongoose.Schema({
    name:String,
    active:{
        type:Boolean,
        default:true
    }
})

const categories=new mongoose.model("categories",categorySchema)

module.exports=categories