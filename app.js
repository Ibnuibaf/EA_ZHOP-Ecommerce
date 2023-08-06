const createError = require('http-errors');
const express = require('express');
const mongoose=require('mongoose')
const exphbs=require('express-handlebars')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

mongoose.connect("mongodb://localhost:27017/eazhop")
.then(()=>{console.log("Database Connected in mongodb://localhost:27017/eazhop");})
.catch((err)=>{console.log(err);})

const homeRouter = require('./routes/home');
const productsRouter = require('./routes/products');
const signupRouter = require('./routes/signup');
const signinRouter = require('./routes/signin');
const adminSigninRouter = require('./routes/adminSignin');
const adminProductsRouter = require('./routes/adminProducts');
const adminUsersRouter = require('./routes/adminUsers');
const adminDashboard = require('./routes/adminDashboard');


const { errorHandler, err404handle, portHandle } = require('./middleware/middleware');

const app = express();

// view engine setup
// const hbs=exphbs.create({
//     extname: '.hbs',
//     defaultLayout: 'userLayout', // Set a default layout (can be any layout name you want to use)
//     layoutsDir: path.join(__dirname, 'views/layouts'),
//     allowProtoProperties: true
// })
// app.engine('hbs', hbs.engine);
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/user/products', productsRouter);
app.use('/signin', signinRouter)
app.use('/signup', signupRouter)
app.use('/admin', adminSigninRouter)
app.use('/admin/dashboard', adminDashboard)
app.use('/admin/products-management', adminProductsRouter)
app.use('/admin/users-management', adminUsersRouter)

// catch 404 and forward to error handler
app.use(err404handle);

// error handler
app.use(errorHandler);

app.listen(8888, portHandle)
