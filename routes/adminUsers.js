const express = require('express');
const usersCollection=require('../models/usersSchema')
const admin=require('../models/adminSchema')

const router = express.Router();


router.get('/',async(req,res)=>{

    try {
        const searchQuery=req.query.search
        let usersList=await usersCollection.find()
        if(searchQuery){
            const searchRegex = new RegExp(searchQuery, 'i');
            usersList=usersList.filter(user=>searchRegex.test(user.first_name))
        }
        res.render('adminUsers',{usersList})
    } catch (error) {
        console.log(error.message);
    }
});
router.patch('/block-user/:user',async(req,res)=>{
    try {
        const user=req.params.user
        await usersCollection.updateOne({_id:user},{$set:{blocked:true}})
        res.send(200)
    } catch (error) {
        console.log(error.message);
    }
})
router.patch('/unblock-user/:user',async(req,res)=>{
    try {
        const user=req.params.user
        await usersCollection.updateOne({_id:user},{$set:{blocked:false}})
        res.send(200)
    } catch (error) {
        console.log(error.message);
    }
})

module.exports = router;
