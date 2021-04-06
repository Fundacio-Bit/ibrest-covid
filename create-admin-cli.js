require('dotenv').config()
const { program } = require('commander')
const { MongoClient } = require('mongodb')
const { mongodbUri, db, adminsCollection } = require('./server.config')
const bcrypt = require('bcryptjs')

const collection = adminsCollection

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  return hash
}

program
  .version('1.0.0')
  .requiredOption('-u, --username <username>', 'user name')
  .requiredOption('-p, --password <password>', 'user password')

program.parse(process.argv)

const { username, password } = program

if (password.length < 6 || password.length > 20) {
  console.log(`Error: 'password' must have a length between 6 and 20 chars.`)
  process.exit(1)
}

const user = { username, password: hashPassword(password) }
console.log('User:', user)

// Connect to MongoDB and insert user
MongoClient.connect(mongodbUri, { useUnifiedTopology: true })
  .then(client => {
    createUser(client)
  })
  .catch(err => {
    console.log(err.toString())
    process.exit(1)
  })

const createUser = (mongoClient) => {
  mongoClient.db(db).collection(collection).insertOne(user)
  .then(result => {
    console.log(`\nUser inserted in MongoDB (collection: ${db}.${collection}) with _id:`, result.insertedId, `\n`)
    return mongoClient.db(db).collection(collection).createIndex({ username: 1 }, { sparse: true, unique: true })
  })
  .then(indexName => {
    process.exit(0)
  })
  .catch(err => {
    console.log(err.toString())
    process.exit(1)
  })
}
