const express = require("express");
const cookieParser = require('cookie-parser');
const middle = require("./src/middleware");
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

app.get("/register", middle.doubleRegister, (req, res) => {
  res.render("register");
});

app.post("/register", middle.addUser, ( req, res) => {
  res.redirect("/urls");
})

app.post("/login", middle.validateCreds, async (req, res) => {
  res.redirect("/urls");
})

app.get("/", (req, res) => {
  res.redirect("login");
});

app.get("/login", middle.doubleRegister, (req, res) => {
  res.render("login")
});

app.use(middle.checkCookie)


app.get("/logout", middle.logout, (req, res) => {
  res.clearCookie("_tinyApp")
  res.redirect("/login");
})

app.get("/urls", middle.getUserURLs, (req, res) => {
  let templateVars = { urls: res.locals.urls};
  res.render("urls_index", templateVars);
})

app.post("/urls", middle.addNewURL, (req, res) => {
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL/delete", middle.delURL, (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/:shortURL", middle.getURL, (req, res) => {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: res.locals.longURL
    };
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", middle.editURL, (req, res) => {
  res.redirect("/urls");
});

app.get("/u/:shortURL", middle.getURL, (req, res) => {
  res.redirect(res.locals.longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});