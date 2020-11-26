import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core'
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption'
import * as PouchdbAdapterIdb from 'pouchdb-adapter-idb'

import { todoSchema } from './Schema'

if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin)
}

addRxPlugin(PouchdbAdapterIdb)
addRxPlugin(RxDBEncryptionPlugin)
addRxPlugin(RxDBValidatePlugin)

const collections = {
  todos: {
    schema: todoSchema
  }
}

async function _create () {
  console.log('DatabaseService: creating database..')
  const db = await createRxDatabase({
    name: 'vuenotion',
    adapter: 'idb',
    password: 'myPassword',
    ignoreDuplicate: true
  })

  console.log('DatabaseService: created database')
  window.db = db

  console.log('DatabaseService: create collections')
  await db.addCollections(collections)

  return db
}
const DatabaseService = {
  DB_CREATE_PROMISE: _create(),
  get () {
    return this.DB_CREATE_PROMISE
  }
}

export default DatabaseService
