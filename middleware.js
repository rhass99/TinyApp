
const validateCreds = (req, res, next) => {
    const {email, password} = req.body
    if (email === "rami@rami.com" && password === "123") {
        res.cookie('_tinyApp', {email: email, password: password})
        next() 
    } else {
        res.redirect("/")
    }
}

const protected = (req, res, next) => {
    if (req.cookies._tinyApp) {
        next()
    } else {
        res.redirect("/")
    }
}

module.exports = {
    validateCreds: validateCreds,
    protected: protected
}