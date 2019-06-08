const express = require("express");
const cookieParser = require('cookie-parser');
const middle = require("./src/middleware");
const encrypt = require("./src/encrypt");
const db = require("./src/users");

require('dotenv').config();

let app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use(cookieParser("very secret", {HttpOnly: true}))

let PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

app.get("/signup", middle.doubleRegister, (req, res) => {
  res.render("register");
});

app.post("/signup", middle.addUser, ( req, res) => {
  res.redirect("/urls");
})

app.post("/login", middle.validateCreds, (req, res) => {
  res.redirect("/urls");
})

app.get("/", (req, res) => {
  res.redirect("login");
});

app.get("/login", middle.doubleRegister, (req, res) => {
  res.render("login")
});

app.use(middle.checkCookie)


app.get("/logout", (req, res) => {
  res.clearCookie("_tinyApp")
  res.redirect("/login");
})

app.get("/urls", (req, res) => {
    let templateVars = { urls: db.urlDatabase };
    res.render("urls_index", templateVars);

})

app.post("/urls", (req, res) => {
  db.urlDatabase[db.generateRandomString(6)] = req.body.longURL;
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL/delete", (req, res) => {
  delete db.urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: db.urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  db.urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(db.urlDatabase[req.params.shortURL]);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});