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
module.exports={
    loggedIn,
    notLogged
}