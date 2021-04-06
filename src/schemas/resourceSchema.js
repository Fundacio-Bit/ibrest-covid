module.exports = {
  $schema: 'http://json-schema.org/draft-07/schema#',

  type: 'object',
  properties: {
    date: { type: 'string', pattern: '^\\d\\d\\d\\d-\\d\\d-\\d\\d$' },
    island: { type: 'string', enum: ['mallorca', 'menorca', 'ibiza', 'formentera'] },
    protectionLevel: { type: 'integer', 'minimum': 0, 'maximum': 4 },
    cumulativeIncidence7days: { type: 'integer', 'minimum': 0, 'maximum': 9999 },
    cumulativeIncidence14days: { type: 'integer', 'minimum': 0, 'maximum': 9999 },
    positiveRate: { type: 'number', 'minimum': 0, 'maximum': 100 },
    vaccinationIndex: { type: 'number', 'minimum': 0, 'maximum': 100 }
  },
  required: ['date', 'island', 'protectionLevel', 'cumulativeIncidence7days', 'cumulativeIncidence14days', 'positiveRate', 'vaccinationIndex'],
  additionalProperties: false
}
