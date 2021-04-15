const express = require('express')
const { ObjectID } = require('mongodb')
const { validateJsonSchema, verifyJWT } = require('@fundaciobit/express-middleware')
const { mongoInsertOne, mongoCreateIndex, mongoReplaceOne, mongoDeleteOne } = require('@fundaciobit/express-redis-mongo')
const { alertSchema } = require('../schemas')

module.exports = ({ mongoClient, db, collection, secret }) => {
  const router = express.Router()

  router.post('/',
    verifyJWT({ secret }),
    validateJsonSchema({ schema: alertSchema, instanceToValidate: (req) => req.body }),
    mongoInsertOne({ mongoClient, db, collection, docToInsert: (req, res) => req.body }),
    mongoCreateIndex({ mongoClient, db, collection, keys: { date: 1 }, options: { sparse: true, unique: true } }),
    (req, res) => { res.status(200).json({ _id: res.locals.insertedId }) }
  )

  router.get('/',
    verifyJWT({ secret }),
    async (req, res, next) => {
      try {
        const docs = await mongoClient.db(db).collection(collection).find({}).limit(0).sort({ date: -1 }).toArray()
        res.locals.results = docs
        next()
      } catch (err) {
        next(err)
      }
    },
    (req, res) => { res.status(200).json(res.locals.results) }
  )

  router.put('/:id',
    verifyJWT({ secret }),
    validateJsonSchema({ schema: alertSchema, instanceToValidate: (req) => req.body }),
    mongoReplaceOne({ mongoClient, db, collection, filter: (req) => ({ _id: new ObjectID(req.params.id) }), contentToReplace: (req, res) => req.body }),
    (req, res) => { res.status(200).send('Document successfully replaced') }
  )

  router.delete('/:id',
    verifyJWT({ secret }),
    mongoDeleteOne({ mongoClient, db, collection, filter: (req) => ({ _id: new ObjectID(req.params.id) }) }),
    (req, res) => { res.status(200).send('Document successfully deleted') }
  )

  return router
}
