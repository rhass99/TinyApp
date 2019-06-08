const db = require("./users")
const encrypt = require("./encrypt")

const addUser = async (req, res, next) => {
  console.log("add user run")
    const {email, password} = req.body
    const id = encrypt.generateMD5Hash(email)
    let sessionId = ''
    try {
      sessionId = await db.addUser(id, email, password)
      res.cookie('_tinyApp', {sessionId})
    } catch (err) {
      res.locals.errors = err.message
    }
    next()
}

const validateCreds = async (req, res, next) => {
  console.log("validate creds run")
  let sessionId = ''
    try {
        sessionId = await db.validateLoignUser(req.body)
        console.log("hi", sessionId)
        res.cookie("_tinyApp", { sessionId })
    } catch (err) {
        res.clearCookie("_tinyApp")
        // console.log(err)
        // res.locals.errors = err.message
    }
    next()
}

const checkCookie = (req, res, next) => {
  console.log("check cookie run")
  if (!req.cookies._tinyApp) {
    console.log("there is no cookie will send u to login")
    res.redirect('/login')
  } else if (!db.validateSession(req.cookies._tinyApp)){
    console.log("There is cookie but session is invalid")
    res.clearCookie("_tinyApp")
    res.redirect('/login')
  } else {
    console.log("User authenticated")
    next()
  }
} 

const doubleRegister = (req, res, next) => {
  if (req.cookies._tinyApp && db.validateSession(req.cookies._tinyApp)) {
    res.redirect('/urls')
  } else {
    next()
  }
}

module.exports = {
    validateCreds,
    addUser,
    doubleRegister,
    checkCookie,
}


// const ERROR_TYPES = {
//     not_authenticated: 'User Not...',
//     not_registered: '',
// }