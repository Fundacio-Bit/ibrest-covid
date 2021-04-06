const express = require('express')
const bcrypt = require('bcryptjs')
const { validateJsonSchema, signJWT } = require('@fundaciobit/express-middleware')
const { mongoFindOne } = require('@fundaciobit/express-redis-mongo')
const { loginSchema } = require('../schemas')
const { AuthenticationError } = require('../errors')

const verifyHashedPassword = async (props) => {
  const { password, hash } = props
  const res = await bcrypt.compare(password, hash)
  return res
}

module.exports = ({ mongoClient, db, collection, secret, profile }) => {
  const router = express.Router()

  router.post('/',
    validateJsonSchema({ schema: loginSchema, instanceToValidate: (req) => req.body }),
    mongoFindOne({ mongoClient, db, collection, query: (req) => ({ username: req.body.username }), responseProperty: 'user' }),
    async (req, res, next) => {
      try {
        const { user } = res.locals
        if (!user) throw new AuthenticationError(`Unknown user: ${req.body.username}`)
        const verified = await verifyHashedPassword({ password: req.body.password, hash: user.password })
        if (!verified) throw new AuthenticationError('Invalid password')
        req.authenticatedUser = { username: user.username, profile, id: user._id.toString() }
        next()
      } catch (err) {
        next(err)
      }
    },
    signJWT({ payload: (req) => ({ ...req.authenticatedUser }), secret, signOptions: {} }),
    (req, res) => { res.status(200).json({ token: req.token, ...req.authenticatedUser }) }
  )

  return router
}
