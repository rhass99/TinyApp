const encrypt = require('./encrypt')
const users = {}

const urlDatabase = {
    "b2xVn2": "https://www.lighthouselabs.ca",
    "9sm5xK": "https://www.google.com"
};

const generateRandomString = (num) => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    const stringLength = num
    let randomString = ''
    for (let i = 0; i < stringLength; i ++) {
      randomString += chars[(Math.floor(Math.random() * chars.length))]
    }
    return randomString
}

const createNewSession = (userID) => {
    console.log("create new session user ran", userID)
    let sessionId = ''
    for (let key in users) {
        if (key === userID) {
            users[key].sessionId = encrypt.generateMD5Hash(generateRandomString(10))
            console.log(users[key].sessionId)
            sessionId = users[key].sessionId
        }
    }
    console.log("create new session", sessionId)
    return sessionId
}

const validateLoignUser = async({email, password}) => {
        console.log("validating login user ran")
        let hashedPass = ''
        let sessionId = ''
        let id = ''
        for (let key in users) {
            if (users[key].email === email) {
                hashedPass = users[key].password_hash
                id = key
            }
        }
        console.log("my id", id)
        console.log("my hashed pass", hashedPass)
    try {
        let verified = await encrypt.comparePassword(password, hashedPass)
        console.log("is verified", verified)
        if (verified) {
            console.log("verified")
            sessionId = createNewSession(id)
            console.log("inside:",sessionId)
        }
    } catch (err) {
        return err
    }
    return sessionId
}

const validateSession = ({sessionId}) => {
    let validSession = false
    for (let key in users) {
        if (users[key].sessionId === sessionId) {
            validSession = true
        }
    }
    console.log("hi2", validSession)
    return validSession
}

const addUser = async (id, email, password) => {
    console.log("adding user ran")
    let exists = false
    for (let key in users) {
        if (users[key].email === email) {
            exists = true
        }
    }
    if (exists === true) {
        return new Error("User exists, please login instead")
    }
    let newUser = {
        id: id,
        sessionId: encrypt.generateMD5Hash(generateRandomString(10)),
        email: email,
        password_hash: password
    }
    try {
        const hashedUser = await encrypt.hashPassword(newUser)
        users[newUser.id] = hashedUser
        return newUser.sessionId
    } catch (err) {
        return err
    }
}

module.exports = {
    users,
    urlDatabase,
    addUser,
    generateRandomString,
    validateLoignUser,
    validateSession
}