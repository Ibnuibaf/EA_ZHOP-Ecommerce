const loggedIn = (req, res, next) => {

    if (req.session.user) {
        next()
    }
    return res.redirect('/signin?message=Log in for Accessibility')
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
    } else if (req.session.user) {
        return res.redirect('/?message=You Logged In Already!')
    } else {
        return res.redirect('/signin?message=Log in for Accessibility')
    }
}
module.exports = {
    loggedIn,
    notLogged,
    verificationPanel
}