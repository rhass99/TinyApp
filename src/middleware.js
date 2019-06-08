const db = require("./users")
const encrypt = require("./encrypt")
const appErrors = require('./errors')

const addUser = async (req, res, next) => {
  const sessionId = await db.addUser(req.body)
  if (!sessionId.message) {
    res.cookie('_tinyApp', {sessionId})
  } else {
    res.locals.errors = sessionId.message;
  }
  next()
}

const validateCreds = async (req, res, next) => {
  const sessionId = await db.validateLoignUser(req.body)
  if (!sessionId.message) {
    res.cookie("_tinyApp", { sessionId })
  } else {
    res.clearCookie("_tinyApp")
    res.locals.errors = sessionId.message
  }
  next()
}

const checkCookie = (req, res, next) => {
  if (!req.cookies._tinyApp) {
    res.locals.errors = appErrors.userNotLoggedIn;
    res.redirect('/login')
  } else if (!db.validateSession(req.cookies._tinyApp)){
    res.locals.errors = appErrors.userNotLoggedIn
    res.clearCookie("_tinyApp")
    res.redirect('/login')
  } else {
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

const logout = (req, res, next) => {
  if (!db.logout(req.cookies._tinyApp)) {
    res.locals.errors = appErrors.serverError
  }
  next()
}

const getUserURLs = (req, res, next) => {
  let urls = db.getUserURLs(req.cookies._tinyApp)
  res.locals.urls = urls
  next()
}

const addNewURL = (req, res, next) => {
  const shortURL = db.generateRandomString(6)
  const request = {
    sessionId:req.cookies._tinyApp.sessionId,
    shortURL:shortURL, 
    longURL:req.body.longURL,
  }
  let urls = db.addNewURL(request)
  res.locals.urls = urls
  next()
}

const getURL = (req, res, next) => {
  const request = {
    sessionId: req.cookies._tinyApp.sessionId,
    shortURL: req.params.shortURL,
  }
  const longURL = db.getURL(request)
  res.locals.longURL = longURL
  next()
}

const editURL = (req, res, next) => {
  const request = {
    sessionId: req.cookies._tinyApp.sessionId,
    shortURL: req.params.shortURL,
    longURL: req.body.longURL
  }
  const urls = db.editURL(request)
  res.locals.urls = urls
  next()
}

const delURL = (req, res, next) => {
  const request = {
    sessionId: req.cookies._tinyApp.sessionId,
    shortURL: req.params.shortURL
  }
  const urls = db.delURL(request)
  res.locals.urls = urls
  next()
}

module.exports = {
    validateCreds,
    addUser,
    doubleRegister,
    checkCookie,
    getUserURLs,
    addNewURL,
    getURL,
    editURL,
    delURL,
    logout
}