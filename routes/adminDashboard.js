const express = require('express');
const admin=require('../models/adminSchema')
const router = express.Router();

/* GET home page. */
router.get('/',(req,res)=>{
    res.render('dashboard')
});


module.exports = router;
