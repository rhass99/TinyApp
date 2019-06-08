const encrypt = require('./encrypt')
const appErrors = require('./errors')
const users = {}

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
    return {message: appErrors.userNotRegistered}
}


const validateLoignUser = ({email, password}) => new Promise((resolve, reject) => {
    let user = {}
    for (let key in users) {
        if (users[key].email === email){
            user = users[key]
        }
    }
    if (!user) {
        resolve({message: appErrors.userNotRegistered})
    }
    encrypt.comparePassword(password, user.password_hash)
        .then((res) => {
            if (res) {
                const sessionId = createNewSession(user.id)
                users[user.id].sessionId = sessionId
                
                resolve(sessionId)
            } else {
                resolve({message: appErrors.wrongPassword})
            }
        })
        .catch((err) => {
            //log err
        })
})


const logout = ({sessionId}) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId){
            delete users[id].sessionId
            return true
        }
    }

    return false
}

const validateSession = ({sessionId}) => {
    for (let key in users) {
        if (users[key].sessionId === sessionId) {
            return true
        }
    }
    return false
}

const addUser = async ({email, password}) => {
    const newId = encrypt.generateMD5Hash(email)
    for (let key in users) {
        if (users[key].email === email) {
            return {message: appErrors.userAlreadyExists}
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
        // log error
        return {message: appErrors.serverError}
    }
    return users[newId].sessionId
}

const getUserURLs = ({sessionId}) => {
    for (let id in users) {    
      if (users[id].sessionId === sessionId){
        return users[id].urlsDatabase
      }
    }
    return {}
}

const addNewURL = ({sessionId, shortURL, longURL}) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId){
            users[id].urlsDatabase[shortURL] = longURL
            return users[id].urlsDatabase
        }
    }
    return {message: appErrors.cannotAddURL}
}

const getURL = ({sessionId, shortURL}) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId){
            return users[id].urlsDatabase[shortURL]
        }
    }
    return {message: appErrors.cannotEditURL}
}

const editURL = ({sessionId, shortURL, longURL}) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId){
            users[id].urlsDatabase[shortURL] = longURL
            return users[id].urlsDatabase
        }
    }
    return {message: appErrors.cannotEditURL}
}
const delURL = ({sessionId, shortURL}) => {
    for (let id in users) {
        if (users[id].sessionId === sessionId){
            delete users[id].urlsDatabase[shortURL]
            return users[id].urlsDatabase
        }
    }
    return {message: appErrors.cannotDeleteURL}
}



module.exports = {
    users,
    addUser,
    generateRandomString,
    validateLoignUser,
    //validateLoignUser2,
    validateSession,
    getUserURLs,
    addNewURL,
    getURL,
    editURL,
    delURL,
    logout
}