const express = require('express')
const { validateJsonSchema, verifyJWT } = require('@fundaciobit/express-middleware')
const { mongoFind } = require('@fundaciobit/express-redis-mongo')
const { searcherParamsSchema } = require('../schemas')

module.exports = ({ mongoClient, db, collection, secret }) => {
  const router = express.Router()

  router.get('/from/:from/to/:to/island/:island',
    verifyJWT({ secret }),
    validateJsonSchema({ schema: searcherParamsSchema, instanceToValidate: (req) => req.params }),
    mongoFind({ mongoClient, db, collection, query: (req) => ({ island: req.params.island }) }),
    (req, res, next) => {
      const { results } = res.locals
      results.forEach(x => x.numDate = parseInt(x.date.replace(/-/g, '')))
      const { from, to } = req.params
      const numFrom = parseInt(from.replace(/-/g, ''))
      const numTo = parseInt(to.replace(/-/g, ''))
      const filteredResults = results.filter(x => x.numDate >= numFrom && x.numDate <= numTo)

      const compare = (a,b) => {
        if (a.numDate < b.numDate) { return -1 }
        if (a.numDate > b.numDate) { return 1 }
        return 0
      }

      filteredResults.sort(compare)
      filteredResults.forEach(x => delete x.numDate)
      res.locals.filteredResults = filteredResults
      next()
    },
    (req, res) => { res.status(200).json(res.locals.filteredResults) }
  )

  return router
}
