const express = require('express');
require('dotenv').config()
const mongoose=require('mongoose')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

mongoose.connect("mongodb://localhost:27017/eazhop")
.then(()=>{console.log("Database Connected in mongodb://localhost:27017/eazhop");})
.catch((err)=>{console.log(err);})

const adminRouter=require('./routes/adminRouter')
const userRouter=require('./routes/userRouter')


const { errorHandler, err404handle, portHandle } = require('./middleware/middleware');

const app = express();

app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter)

app.use(err404handle);

// error handler
app.use(errorHandler);

app.listen(8888, portHandle)
