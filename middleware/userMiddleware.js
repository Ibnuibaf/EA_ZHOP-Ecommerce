const usersCollection = require("../models/usersSchema");
const loggedIn = async (req, res, next) => {

    if (req.session.user) {
        try {
            const user = req.session.user;
            const userDetails = await usersCollection.findOne({ email: user });
            req.userDetails = userDetails;
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
module.exports = {
    loggedIn,
    notLogged,
    verificationPanel
}