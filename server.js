require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { MongoClient } = require('mongodb')
const routers = require('./src/routers')
const { mongodbUri, db, resourceCollection, adminsCollection, resourcePath, serverIp, serverPort } = require('./server.config')

const secret = process.env.SECRET_KEY

// Open MongoDB connection
MongoClient.connect(mongodbUri, { useUnifiedTopology: true, poolSize: 10 })
  .then(client => {
    console.log('Connected to MongoDB...')
    createApp(client)
  })
  .catch(err => {
    console.log(err.toString())
    process.exit(1)
  })

const createApp = (mongoClient) => {
  const app = express()
  app.use(bodyParser.json())
  app.use(cors())

  // Login
  app.use('/login-admin', routers.login({ mongoClient, db, collection: adminsCollection, secret, profile: 'admin' }))

  // Basic CRUD
  app.use(resourcePath, routers.basicCRUD({ mongoClient, db, collection: resourceCollection, secret }))

  // Error handling middleware
  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  app.listen(serverPort, () => { console.log(`Server running on http://${serverIp}:${serverPort}/`) })
}
