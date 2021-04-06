const express = require('express')
const { ObjectID } = require('mongodb')
const { validateJsonSchema, verifyJWT } = require('@fundaciobit/express-middleware')
const { mongoInsertOne, mongoCreateIndex, mongoFind, mongoFindOne, mongoReplaceOne, mongoDeleteOne } = require('@fundaciobit/express-redis-mongo')
const { resourceSchema } = require('../schemas')

module.exports = ({ mongoClient, db, collection, secret }) => {
  const router = express.Router()

  router.post('/',
    verifyJWT({ secret }),
    validateJsonSchema({ schema: resourceSchema, instanceToValidate: (req) => req.body }),
    mongoInsertOne({ mongoClient, db, collection, docToInsert: (req, res) => req.body }),
    mongoCreateIndex({ mongoClient, db, collection, keys: { date: 1, island: 1 }, options: { sparse: true, unique: true } }),
    (req, res) => { res.status(200).json({ _id: res.locals.insertedId }) }
  )

  router.get('/',
    mongoFind({ mongoClient, db, collection, query: (req) => ({}) }),
    (req, res) => { res.status(200).json(res.locals.results) }
  )

  router.get('/:id',
    mongoFindOne({ mongoClient, db, collection, query: (req) => ({ _id: new ObjectID(req.params.id) }) }),
    (req, res) => {
      if (!res.locals.result) return res.status(404).send('Document not found')
      res.status(200).json(res.locals.result)
    }
  )

  router.put('/:id',
    verifyJWT({ secret }),
    validateJsonSchema({ schema: resourceSchema, instanceToValidate: (req) => req.body }),
    mongoReplaceOne({ mongoClient, db, collection, filter: (req) => ({ _id: new ObjectID(req.params.id) }), contentToReplace: (req, res) => req.body, upsert: true }),
    (req, res) => {
      const { upsertedId } = res.locals
      if (upsertedId) return res.status(200).json({ _id: upsertedId })  // Created new doc
      res.status(200).send('Document successfully replaced')
    }
  )

  router.delete('/:id',
    verifyJWT({ secret }),
    mongoDeleteOne({ mongoClient, db, collection, filter: (req) => ({ _id: new ObjectID(req.params.id) }) }),
    (req, res) => { res.status(200).send('Document successfully deleted') }
  )

  return router
}
