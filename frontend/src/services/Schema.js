const pageSchema = {
  keyCompression: true,
  version: 0,
  title: 'page',
  description: 'page contains blocks',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    title: {
      type: 'string'
    },
    content: {
      type: 'string'
    },
    order: {
      type: 'integer'
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    },
    userId: {
      type: 'string'
    }
  },
  indexes: ['createdAt'],
  required: ['userId', 'id', 'title'],
  additionalProperties: true
}

export { pageSchema }
