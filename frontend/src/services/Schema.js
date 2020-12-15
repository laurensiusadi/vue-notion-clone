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
    blocks: {
      type: 'array',
      uniqueItems: true,
      items: {
        id: {
          type: 'string'
        },
        text: {
          type: 'string'
        },
        blockType: {
          type: 'string'
        },
        isCompleted: {
          type: 'boolean'
        },
        createdAt: {
          type: 'string',
          format: 'date-time'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time'
        },
        pageId: {
          type: 'string'
        },
        userId: {
          type: 'string'
        }
      }
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
  required: ['userId', 'createdAt'],
  additionalProperties: true
}

export { pageSchema }
