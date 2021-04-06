module.exports = {
  $schema: 'http://json-schema.org/draft-07/schema#',

  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['username', 'password'],
  additionalProperties: false
}
