const bcrypt = require('bcrypt');
const crypto = require('crypto');

// adds a pepper from server and returns a fixed length password.
const addPepper = (toHMAC) => {
  const pepper = process.env.PEPPER;
  if (!pepper) {
    throw new Error('No internal Password hasher');
  }
  const hmac = crypto.createHmac('sha1', pepper);
  hmac.update(toHMAC);
  return hmac.digest('hex');
};

const comparePassword = async (plainPassword, hash) => {
  // uses function addPepper to pepper the password before checking equality.
  const pepperedPassword = addPepper(plainPassword);
  let truth = false
  try {
    truth = await bcrypt.compare(pepperedPassword, hash);
  } catch (err) {
    throw (err);
  }
  return truth
};

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
    throw (err);
  }
  // Returns a Promise of the ClientUserAccount
  return clientUserAcc;
};

// // Check for account password - used in UserAccount middleware
// const checkUserAccountPass = async (plain, hash) => {
//   let isRegistered = false;
//   try {
//     isRegistered = await comparePassword(plain, hash);
//   } catch (err) {
//     throw err;
//   }
//   return isRegistered;
// };

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