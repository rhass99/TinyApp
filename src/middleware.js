const db = require("./users")

const validateCreds = async (req) => {
    console.log("validate cookie middleware ran")
    let sessionId = ''
    try {
        sessionId = await db.validateLoignUser(req.body)
        console.log("this should be ok", sessionId)
    } catch (err) {
        console.log(err)
        return err
        //res.redirect("/login")
    }
    return sessionId
}

const protected = (req, res, next) => {
    console.log("protected cookie middleware ran")
    if (req.cookies._tinyApp) {
        console.log("cookie", req.cookies._tinyApp)
        let validSession = db.validateSession(req.cookies._tinyApp)
        console.log("valid session from protected cookie", validSession)
        if (validSession) {
            next()
        } else {
            res.redirect("/login")
        }
    } else {
        res.redirect("/login")
    }
}

const checkCookie = (req, res, next) => {
    console.log("check cookie middleware ran")
    if (req.cookies._tinyApp) {
        const validSession = db.validateSession(req.cookies._tinyApp)
        if (validSession) {
            res.redirect("/urls")
        } else {
            next()
        }
    } else {
        next()
    }
}

module.exports = {
    validateCreds: validateCreds,
    protected: protected,
    checkCookie: checkCookie,
}

// Map {
//     '2b406a620d046edaac9af9c79f1caa9d' => 
//     { id: '2b406a620d046edaac9af9c79f1caa9d',
//       sessionId: '53c05cc9171419df2d0b0844446ee1ce',
//       email: 'rhass99@gmail.com',
//       password_hash: '$2b$05$8IQDMnKwPd3oKFOoVGgm9ODAfX5',
//       password_salt: '$2b$05$8IQDMnKwPd3oKFOoVGgm9O',
//       password_strength: 5 
//     } 
// }