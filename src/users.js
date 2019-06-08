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
    for (let key in users) {
        if (key === userID) {
            users[key].sessionId = encrypt.generateMD5Hash(generateRandomString(10))
            return users[key].sessionId
        }
    }
    return new Error("User Not registered")
}

const validateLoignUser = async({email, password}) => {
    console.log("validation", email, password)
    let sessionId = ''
    for (let key in users) {
        if (users[key].email === email) {
            let hashedPass = users[key].password_hash
            let id = key
            try {
                const verified = await encrypt.comparePassword(password, hashedPass)
                if (verified) {
                    console.log(verified)
                    sessionId = createNewSession(id)
                    console.log(sessionId)
                } else {
                    return new Error("Wrong Password")
                    //return false
                }
            } catch (err) {
                return err
                // return false
            }
        } else {
            return new Error("User Not registered")
            //return false
        }
    }
    console.log(sessionId)
    return sessionId
}

const validateSession = ({sessionId}) => {
    for (let key in users) {
        if (users[key].sessionId === sessionId) {
            return true
        }
    }
    // log error
    return false
    //return new Error("Invalid session")
}

const addUser = async (id, email, password) => {
    for (let key in users) {
        if (users[key].email === email) {
            return new Error("User exists, please login instead")
        }
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
    } catch (err) {
        return err
    }
    return newUser.sessionId
}

module.exports = {
    users,
    urlDatabase,
    addUser,
    generateRandomString,
    validateLoignUser,
    validateSession
}