const express = require("express");
let app = express();
app.use(express.json())
app.use(express.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase}
    res.render("urls_index", templateVars);
})

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL
  console.log(urlDatabase)
  res.redirect("/urls")
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});