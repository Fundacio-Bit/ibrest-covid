module.exports = {
  $schema: 'http://json-schema.org/draft-07/schema#',

  type: 'object',
  properties: {
    date: { type: 'string', pattern: '^\\d\\d\\d\\d-\\d\\d-\\d\\d$' },
    es: { type: 'string' },
    ca: { type: 'string' },
    en: { type: 'string' },
    de: { type: 'string' }
  },
  required: ['date', 'es', 'ca', 'en', 'de'],
  additionalProperties: false
}
