const mongoose=require('mongoose')
const productsCollection = require("../models/productsSchema")
const usersCollection=require("../models/usersSchema");
const categories = require('../models/categorySchema');


module.exports={
    loadHome:(req,res)=>{
        res.render('home')
    },
    loadSignIn:(req,res)=>{
        res.render('signin')
    },
    loadSignUp:(req,res)=>{
        res.render('signup')
    },
    loadProductView:async (req, res) => {
        try {
            const filterMin=req.query.min
            const filterMax=req.query.max
            const searchQuery=req.query.search
            const category=req.query.category
            const categoriesList= await categories.find()
            let productsList = await productsCollection.find()
            let foundCategory=''
            
            if(category){
                const catObjectId =new mongoose.Types.ObjectId(category);
                productsList =productsList.filter(products=>products.category.equals(catObjectId))
                foundCategory = categoriesList.find(category => category._id.equals(catObjectId));
            }
            if(filterMax||filterMin){
                productsList=productsList.filter(products=>products.mrp>filterMin&&products.mrp<filterMax)
            }
            if(searchQuery){
                const searchRegex = new RegExp(searchQuery, 'i');
                productsList=productsList.filter(products=>searchRegex.test(products.prd_name))
            }
            return res.render('products', { productsList ,categoriesList,foundCategory});
    
        } catch (error) {
            console.log(error.stack);
        }
    },
    loadProductDetails:async (req, res) => {
        try {
            const prd_id=req.params.id
            const user=req.cookies.user
            const productDetails= await productsCollection.findOne({_id:prd_id})
            const userDetails= await usersCollection.findOne({_id:user})
            let wishlist=false
            if(user){
                wishlist= userDetails.wishlist.find((prd)=>prd==prd_id)
            }
            console.log(wishlist);
            
            res.render('product-details',{productDetails,wishlist})
        } catch (error) {
            console.log(error.message);
        }
       
    },
    removeFromWishlist:async (req,res)=>{
        try {
            const prd_id=req.params.id
            const user=req.cookies.user
            await usersCollection.updateOne({_id:user},{$pull:{wishlist:prd_id}})
             res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
    addToWishlist:async(req,res)=>{
        try {
            const prd_id=req.params.id
            const user=req.cookies.user
            await usersCollection.updateOne({_id:user},{$push:{wishlist:prd_id}})
            res.send(200)
        } catch (error) {
            console.log(error.message);
        }
    },
}