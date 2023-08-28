const usersCollection = require("../models/usersSchema");
const loggedIn = async (req, res, next) => {

    if (req.session.user) {
        try {
            const user = req.session.user;
            const userDetails = await usersCollection.findOne({ email: user });
            req.userDetails = userDetails;
            if(userDetails.blocked){
                req.session.destroy((err) => {
                    console.log(err);
                    res.status(500)
                })
                res.clearCookie('connect.sid')
                res.redirect('/signin?message=Your account is blocked by administrator')
            }
            next();
        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }

    } else {
        return res.redirect('/signin?message=Log in for Accessibility');
    }

}

const notLogged = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/?message=You Logged In Already!')
    }
    next()
}
const verificationPanel = (req, res, next) => {
    if (req.session.otpStage) {
        next()

    } else {
        return res.redirect('/signin?message=Log in for Accessibility')
    }
}
const ordered=(req,res,next)=>{
    if(!req.session.ordered){
        next()
    }else{
        return res.redirect("/user/orders?message=Your order has been completed already!")
    }
}
module.exports = {
    loggedIn,
    notLogged,
    verificationPanel,
    ordered
}