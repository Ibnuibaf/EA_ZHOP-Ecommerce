const express = require('express');
require('dotenv').config()
const mongoose = require('mongoose')
const config = require('./config/config')
const path = require('path');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const adminRouter = require('./routes/adminRouter')
const userRouter = require('./routes/userRouter')


const { errorHandler, err404handle, portHandle } = require('./middleware/middleware');

const app = express();
mongoose.connect(config.mongoUrl)
    .then(() => { console.log("Database Connected in mongodb://localhost:27017/eazhop"); })
    .catch((err) => { console.log(err); })

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: ({ maxAge: 86400000 })
}))
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    next();
});

app.use('/', userRouter);
app.use('/admin', adminRouter)

app.use(err404handle);

// error handler
app.use(errorHandler);

app.listen(8888, portHandle)
