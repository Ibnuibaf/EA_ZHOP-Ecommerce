module.exports = {
    errorHandler: function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        console.log(err);
        // render the error page
        const errStatus=err.status || 500
        const errMessage=err.message
        res.render('error', { errStatus,errMessage });
    },
    err404handle: function (req, res, next) {
        next();
    },
    portHandle: () => {
        console.log("Server Running on http://localhost:8888/");
    }

}