const todoSchema = {
  title: 'todo schema',
  description: 'todo schema',
  version: 0,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    text: {
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
    userId: {
      type: 'string'
    }
  },
  indexes: ['createdAt'],
  required: ['text', 'isCompleted', 'userId', 'createdAt'],
  additionalProperties: true
}

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
      type: 'array'
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

const blockSchema = {
  keyCompression: true,
  version: 0,
  title: 'page block',
  description: 'block in pages',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    text: {
      type: 'string'
    },
    blockType: {
      type: 'string'
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
  },
  indexes: ['createdAt'],
  required: ['text', 'pageId', 'userId', 'createdAt'],
  additionalProperties: true
}

export { todoSchema, pageSchema, blockSchema }
