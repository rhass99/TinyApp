const express = require("express");
const cookieParser = require('cookie-parser')
const middle = require("./src/middleware")
const encrypt = require("./src/encrypt")
const db = require("./src/users")

require('dotenv').config();

let app = express();
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(cookieParser("very secret", {HttpOnly: true}))

let PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("login");
});

app.get("/logout", (req, res) => {
  res.clearCookie("_tinyApp")
  res.redirect("/login")
})

app.get("/login", middle.checkCookie, (req, res) => {
  res.render("login");
});

app.get("/signup", middle.checkCookie, (req, res) => {
  res.render("register");
});

app.post("/signup", middle.checkCookie, (req, res, next) => {
  const {email, password} = req.body
  const id = encrypt.generateMD5Hash(email)
  db.addUser(id, email, password)
    .then(sessionId => {
      res.cookie('_tinyApp', {sessionId})
      console.log("sessionId:", sessionId)
      res.redirect("/login");
    })
    .catch(err => {
      res.redirect("/register");
    })
});

app.post("/login", (req, res, next) => {
  console.log(req.body)
  middle.validateCreds(req)
    .then((sessionId) => {
      res.cookie('_tinyApp', {sessionId})
      res.redirect("/urls")
    })
    .catch((err) => {
      console.log(err)
      res.redirect('/login')
    })
})

app.use(middle.protected)

app.get("/urls", (req, res, next) => {
    let templateVars = { urls: db.urlDatabase }
    res.render("urls_index", templateVars);
})

app.post("/urls", (req, res, next) => {
  db.urlDatabase[db.generateRandomString(6)] = req.body.longURL
  res.redirect("/urls")
})

app.get("/urls/new", (req, res, next) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL/delete", (req, res, next) => {
  delete db.urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.get("/urls/:shortURL", (req, res, next) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: db.urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res, next) => {
  db.urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res, next) => {
  res.redirect(db.urlDatabase[req.params.shortURL])
});

app.use((err, req, res, next) => {
  if (err) {
    console.log(err)
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});