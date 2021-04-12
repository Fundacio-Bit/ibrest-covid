const express = require('express')
const { validateJsonSchema, verifyJWT } = require('@fundaciobit/express-middleware')
const { searcherParamsSchema } = require('../schemas')

module.exports = ({ mongoClient, db, collection, secret }) => {
  const router = express.Router()

  router.get('/from/:from/to/:to/island/:island/order/:order',
    verifyJWT({ secret }),
    validateJsonSchema({ schema: searcherParamsSchema, instanceToValidate: (req) => req.params }),
    async (req, res, next) => {
      try {
        const query = req.params.island === '--all--' ? {} : { island: req.params.island }
        const order = req.params.order === 'desc' ? -1 : 1
        const docs = await mongoClient.db(db).collection(collection).find(query).limit(0).sort({ date: order }).toArray()
        res.locals.results = docs
        next()
      } catch (err) {
        next(err)
      }
    },
    (req, res, next) => {
      const { results } = res.locals
      results.forEach(x => x.numDate = parseInt(x.date.replace(/-/g, '')))
      const { from, to } = req.params
      const numFrom = parseInt(from.replace(/-/g, ''))
      const numTo = parseInt(to.replace(/-/g, ''))
      const filteredResults = results.filter(x => x.numDate >= numFrom && x.numDate <= numTo)
      filteredResults.forEach(x => delete x.numDate)
      res.locals.filteredResults = filteredResults
      next()
    },
    (req, res) => { res.status(200).json(res.locals.filteredResults) }
  )

  router.get('/lastrecord',
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
    (req, res) => { res.status(200).json(res.locals.results.slice(0, 4)) }
  )

  return router
}
