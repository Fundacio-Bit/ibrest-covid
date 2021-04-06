module.exports = {
  $schema: 'http://json-schema.org/draft-07/schema#',

  type: 'object',
  properties: {
    from: { type: 'string', pattern: '^\\d\\d\\d\\d-\\d\\d-\\d\\d$' },
    to: { type: 'string', pattern: '^\\d\\d\\d\\d-\\d\\d-\\d\\d$' },
    island: { type: 'string', enum: ['mallorca', 'menorca', 'ibiza', 'formentera'] }
  },
  required: ['from', 'to', 'island'],
  additionalProperties: false
}
