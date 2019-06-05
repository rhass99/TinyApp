const express = require("express");
const cookieParser = require('cookie-parser')
const middle = require("./middleware")

let app = express();
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(cookieParser("very secred", {HttpOnly: true}))

let PORT = 8080; // default port 8080

const generateRandomString = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  const stringLength = 6
  let randomString = ''
  for (let i = 0; i < stringLength; i ++) {
    randomString += chars[(Math.floor(Math.random() * chars.length))]
  }
  return randomString
}

let urlDatabase = {
  "b2xVn2": "https://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.com"
};

app.set("view engine", "ejs");

app.get("/logout", (req, res) => {
  res.clearCookie("_tinyApp")
  res.redirect("/login")
})

app.get("/", (req, res) => {
  if (req.cookies._tinyApp) {
    res.redirect("/urls")
  }
  res.redirect("login");
});

app.get("/login", (req, res) => {
  if (req.cookies._tinyApp) {
    res.redirect("/urls")
  }
  res.render("login");
});

app.post("/login", middle.validateCreds, (req, res) => {
  res.redirect("/urls")
})

app.use(middle.protected)

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase }
    res.render("urls_index", templateVars);
})

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL
  res.redirect("/urls")
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])
});

app.use((err, req, res, next) => {
  if (err) {
    console.log(err)
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});