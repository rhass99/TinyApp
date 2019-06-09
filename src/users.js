const encrypt = require('./encrypt')
const appErrors = require('./errors')
const users = {}

// Generates a random string for the shortURL
const generateRandomString = (num) => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    const stringLength = num
    let randomString = ''
    for (let i = 0; i < stringLength; i++) {
        randomString += chars[(Math.floor(Math.random() * chars.length))]
    }
    return randomString
}

// Creates a new session ID to be stored on the database
const createNewSession = (userID) => {
    for (let key in users) {
        if (key === userID) {
            users[key].sessionId = encrypt.generateMD5Hash(generateRandomString(10))
            return users[key].sessionId
        }
    }
    //return new Error(appErrors.userNotRegistered)
    throw ({ message: appErrors.userNotRegistered })
}

// Validates if user is logged in
const validateLoignUser = async ({ email, password }) => {
    if (!users) {
        throw ({ message: appErrors.userNotRegistered })
    }
    let user = {}
    for (let key in users) {
        if (users[key].email === email) {
            user = users[key]
        }
    }
    if (!user) {
        throw ({ message: appErrors.userNotRegistered })
    }
    let verified = false
    let sessionId = ''
    try {
        verified = await encrypt.comparePassword(password, user.password_hash)
        if (verified) {
            sessionId = createNewSession(user.id)
            users[user.id].sessionId = sessionId;
        } else {
            throw ({ message: appErrors.wrongPassword })
        }
    } catch (err) {
        // log this error
        return new Error(appErrors.serverError)
    }
    return sessionId
}

// Logs user out and clears session and cookie
const logout = ({ sessionId }) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId) {
            delete users[id].sessionId
            return true
        }
    }
    return false
}

// Validates user session before passing user to protected routes
const validateSession = ({ sessionId }) => {
    for (let key in users) {
        if (users[key].sessionId === sessionId) {
            return true
        }
    }
    throw ({ message: appErrors.invalidSession })
}

// Adds new user to database
// Creates a new session
// Hashes password
const addUser = async ({ email, password }) => {
    const newId = encrypt.generateMD5Hash(email)
    for (let key in users) {
        if (users[key].email === email) {
            throw ({ message: appErrors.userRegisteredAlready })
        }
    }
    let newUser = {
        id: newId,
        sessionId: encrypt.generateMD5Hash(generateRandomString(10)),
        email: email,
        password_hash: password,
        urlsDatabase: {}
    }
    try {
        const hashedUser = await encrypt.hashPassword(newUser)
        users[newId] = hashedUser
    } catch (err) {
        // log this error
        return new Error(appErrors.serverError)
    }
    return users[newId].sessionId
}

// Gets list of user URLs from DB
const getUserURLs = ({ sessionId }) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId) {
            return users[id].urlsDatabase
        }
    }
    throw { message: appErrors.userNotLoggedIn }
}

// Adds new URL to User
const addNewURL = ({ sessionId, shortURL, longURL }) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId) {
            users[id].urlsDatabase[shortURL] = longURL
            return users[id].urlsDatabase
        }
    }
    throw { message: appErrors.cannotAddURL }
}

// Gets the LongURL corresponding to ShortURL
const getURL = ({ sessionId, shortURL }) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId) {
            return users[id].urlsDatabase[shortURL]
        }
    }
    throw { message: appErrors.cannotAddURL }
}

// Edits LongURL
const editURL = ({ sessionId, shortURL, longURL }) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId) {
            users[id].urlsDatabase[shortURL] = longURL
            return users[id].urlsDatabase
        }
    }
    throw { message: appErrors.cannotEditURL }
}

// Delets URL
const delURL = ({ sessionId, shortURL }) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId) {
            delete users[id].urlsDatabase[shortURL]
            return users[id].urlsDatabase
        }
    }
    throw { message: appErrors.cannotDeleteURL }
}

module.exports = {
    users,
    addUser,
    generateRandomString,
    validateLoignUser,
    validateSession,
    getUserURLs,
    addNewURL,
    getURL,
    editURL,
    delURL,
    logout
}