
const mongoose=require('mongoose')



const productsSchema=new mongoose.Schema({
    prd_name:{
        type:String,

    },
    prd_images:{
        type:[String],
    },
    category:{
        type:mongoose.Types.ObjectId,
    },
    description:{
        type:String,
    },
    additional_info:String,
    stock:{
        type:Number,
        default:0
    },
    discount:{
        type:Number,
    },
    mrp:{
        type:Number,
    },
    purchase:{
        type:Number,
    },
    reviews:[{
        user:mongoose.Types.ObjectId,
        feedback:String,
        rating:Number
    }],
    active:{
        type:Boolean,
        default:true
    }
})

const productsCollection=new mongoose.model("products",productsSchema)

module.exports=productsCollection