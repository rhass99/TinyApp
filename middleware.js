
const validateCreds = (req, res, next) => {
    const {email, password} = req.body
    if (email === "rami@rami.com" && password === "123") {
        res.cookie('_tinyApp', {email: email, password: password})
        next() 
    } else {
        res.redirect("/login")
    }
}

const protected = (req, res, next) => {
    if (req.cookies._tinyApp) {
        next()
    } else {
        res.redirect("/login")
    }
}

module.exports = {
    validateCreds: validateCreds,
    protected: protected
}