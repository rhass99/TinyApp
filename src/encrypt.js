const bcrypt = require('bcrypt');
const crypto = require('crypto');
const appErrors = require('./errors')

// adds a pepper from server and returns a fixed length password.
const addPepper = (toHMAC) => {
  const pepper = process.env.PEPPER;
  if (!pepper) {
    return new Error("No internal Password hasher");
  }
  const hmac = crypto.createHmac('sha1', pepper);
  hmac.update(toHMAC);
  return hmac.digest('hex');
};

// Returns a promise
// Compares plain and hashed password
const comparePassword = async (plainPassword, hash) => {
  if (!hash) {
    return new Error(appErrors.userNotRegistered)
  }
  // uses function addPepper to pepper the password before checking equality.
  const pepperedPassword = addPepper(plainPassword);
  let ok = false
  try {
    ok = await bcrypt.compare(pepperedPassword, hash)
  } catch (err) {
    return err
  }
  return ok
}


// Returns a promise with updated object with new keys
// password_salt and password_hash
const hashPassword = async (clientUserAcc) => {
  // uses function addPepper to pepper the password before checking equality.
  const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
  const pepperedPassword = addPepper(clientUserAcc.password_hash);
  try {
    // Creates salt and adds it to the clientUserAcc
    const dataSalt = await bcrypt.genSalt(saltRounds);
    clientUserAcc.password_salt = dataSalt;
    // Hashes password and adds it to ClientUserAcc
    const dataHash = await bcrypt.hash(pepperedPassword, dataSalt);
    clientUserAcc.password_hash = dataHash;
    clientUserAcc.password_strength = saltRounds;
  } catch (err) {
    return new Error("Cannot hash password - bcrypt");
  }
  // Returns a Promise of the ClientUserAccount
  return clientUserAcc;
};

// Generares a unique MD5 Hash for the user ID from user Email
const generateMD5Hash = (inputToHash) => {
    let MD5Hash = crypto.createHash('md5')
    MD5Hash.update(inputToHash)
    return resultHash = MD5Hash.digest('hex')
}

module.exports = {
  hashPassword,
  comparePassword,
  generateMD5Hash
};