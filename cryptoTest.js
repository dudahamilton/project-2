// encryption is a two way process -- data is "encrypted" using an algorithm and key
// you must know wha the key is to decrypt or unscramble the data

// use crypto-js for encryption
const mySecret = 'I eat cookies for breakfast'

const secretKey = 'myPassword'

//advanced encryption standard algo
const crypto = require('crypto-js')

const myEncryption = crypto.AES.encrypt(String(100), secretKey)
console.log(myEncryption.toString())

const decrypt = crypto.AES.decrypt(myEncryption.toString(), secretKey)
console.log(decrypt.toString(crypto.enc.Utf8))

// passwords in the db will be hashed
//hashing is a one way process, once data has been hasehd you cannot unhasit
//hasing functions always return a hash of equal length regardeless of input
//hasing function always return the same output given the same input
const bcrypt = require('bcrypt')

const userPassword = '12345password'
const hashedPassword = bcrypt.hashSync(userPassword, 12)
console.log(hashedPassword)

//console.log(bcrypt.compareSync('wrong', hashedPassword))




//const cryptoNode= require('crypto')

//const hash = cryptoNODE.createHash('sha256').update('a', 'utf8').digest()
//console.log(hash.toString('hex'))