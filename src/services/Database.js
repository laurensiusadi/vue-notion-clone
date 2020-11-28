import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
// import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql'
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption'
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { RxDBKeyCompressionPlugin } from 'rxdb/plugins/key-compression'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import * as PouchdbAdapterIdb from 'pouchdb-adapter-idb'

import { pageSchema } from './Schema'

if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin)
}

addRxPlugin(PouchdbAdapterIdb)
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBUpdatePlugin)
// addRxPlugin(RxDBReplicationGraphQLPlugin)
addRxPlugin(RxDBEncryptionPlugin)
addRxPlugin(RxDBValidatePlugin)
addRxPlugin(RxDBMigrationPlugin)
addRxPlugin(RxDBKeyCompressionPlugin)

const collections = {
  pages: {
    schema: pageSchema
  }
}

async function _create () {
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('DatabaseService: removing database..')
  //   await removeRxDatabase('vuenotion', 'idb')
  // }
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
