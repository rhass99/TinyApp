const db = require("./users")
const appErrors = require('./errors')

const addUser = async (req, res, next) => {
  let sessionId = ''
  try {
    sessionId = await db.addUser(req.body)
    res.cookie('_tinyApp', { sessionId })
    next()
  } catch (err) {
    res.redirect('/login?error=' + encodeURIComponent(err.message))
  }
}

const validateCreds = async (req, res, next) => {
  let sessionId = ''
  try {
    sessionId = await db.validateLoignUser(req.body)
    res.cookie("_tinyApp", { sessionId })
    next()
  } catch (err) {
    res.clearCookie("_tinyApp")
    res.redirect('/login?error=' + encodeURIComponent(err.message))
  }
}

const authenticate = (req, res, next) => {
  if (!req.cookies._tinyApp) {
    res.redirect('/login?error=' + encodeURIComponent(appErrors.userNotLoggedIn))
  } else {
    try {
      let valid = db.validateSession(req.cookies._tinyApp)
      if (valid) {
        res.locals.useremail = valid
        next()
      }
    } catch (err) {
      res.clearCookie("_tinyApp")
      res.redirect('/login?error=' + encodeURIComponent(err.message))
    }
  }
}

const getUserURLs = (req, res, next) => {
  let urls = {}
  try {
    urls = db.getUserURLs(req.cookies._tinyApp)
    res.locals.urls = urls
    next()
  } catch (err) {
    res.redirect('/login?error=' + encodeURIComponent(err.message))
  }
}

const doubleRegister = (req, res, next) => {
  if (req.cookies._tinyApp && db.validateSession(req.cookies._tinyApp)) {
    res.redirect('/urls')
  } else {
    next()
  }
}

const addNewURL = (req, res, next) => {
  const shortURL = db.generateRandomString(6)
  const request = {
    sessionId: req.cookies._tinyApp.sessionId,
    shortURL: shortURL,
    longURL: req.body.longURL,
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

const visitURL = (req, res, next) => {
  let longURL = ''
  try {
    longURL = db.visitURL(req.params.shortURL)
    res.redirect(longURL)
  } catch (err) {
    res.redirect('/login?error=' + encodeURIComponent(err.message))
  }
}

module.exports = {
  validateCreds,
  visitURL,
  addUser,
  authenticate,
  doubleRegister,
  getUserURLs,
  addNewURL,
  getURL,
  editURL,
  delURL,
}