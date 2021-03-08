import {
  createRxDatabase,
  addRxPlugin,
  removeRxDatabase
} from 'rxdb/plugins/core'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption'
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { RxDBKeyCompressionPlugin } from 'rxdb/plugins/key-compression'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import * as PouchdbAdapterIdb from 'pouchdb-adapter-idb'

import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import { pageSchema } from './Schema'
import store from '../store'

if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin)
}

addRxPlugin(PouchdbAdapterIdb)
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBUpdatePlugin)
addRxPlugin(RxDBEncryptionPlugin)
addRxPlugin(RxDBValidatePlugin)
addRxPlugin(RxDBMigrationPlugin)
addRxPlugin(RxDBKeyCompressionPlugin)
addRxPlugin(RxDBReplicationGraphQLPlugin)

const syncURL = 'localhost:8080/v1/graphql'

const collections = {
  pages: {
    schema: pageSchema
  }
}

const batchSize = 5

const pullQueryBuilder = (userId) => {
  return (doc) => {
    if (!doc) {
      doc = {
        id: '',
        updatedAt: new Date(0).toUTCString()
      }
    }
    const query = `{
      page(
        where: {
          _or: [
            {updatedAt: {_gt: "${doc.updatedAt}"}},
            {
              updatedAt: {_eq: "${doc.updatedAt}"},
              id: {_gt: "${doc.id}"}
            }
          ],
          userId: {_eq: "${userId}"} 
        },
        limit: ${batchSize},
        order_by: [{updatedAt: asc}, {id: asc}]
      ) {
        id
        title
        content
        order
        createdAt
        updatedAt
        userId
        deleted
      }
    }`
    return {
      query,
      variables: {}
    }
  }
}

const pushQueryBuilder = doc => {
  const query = `
    mutation InsertPage($page: [page_insert_input!]!) {
    insert_page(
      objects: $page,
      on_conflict: {
        constraint: page_pkey,
        update_columns: [title, content, order, updatedAt, deleted]
      }
    ) {
        returning {
          id
        }
      }
    }
  `
  const variables = {
    page: doc
  }
  return {
    query,
    variables
  }
}

export class GraphQLReplicator {
  constructor(db) {
    this.db = db
    this.replicationState = null
    this.subscriptionClient = null
  }

  async restart(auth) {
    this.stop()
    this.replicationState = await this.setupGraphQLReplication(auth)
    this.subscriptionClient = await this.setupGraphQLSubscription(auth, this.replicationState)
  }

  stop() {
    console.log('GraphQLReplicator: stop')
    if (this.replicationState) {
      this.replicationState.cancel()
    }
    if (this.subscriptionClient) {
      this.subscriptionClient.close()
    }
  }

  async setupGraphQLReplication(auth) {
    const replicationState = this.db.collections.pages.syncGraphQL({
      url: 'http://' + syncURL,
      headers: {
        Authorization: `Bearer ${auth.idToken}`
      },
      push: {
        batchSize,
        queryBuilder: pushQueryBuilder,
        modifier: (doc) => {
          console.log('push modifier', doc)
          // if (doc.userId !== auth.idToken) {
          //   return
          // }
          return doc
        }
      },
      pull: {
        queryBuilder: pullQueryBuilder(auth.userId)
      },
      live: true,
      /**
       * Because the websocket is used to inform the client
       * when something has changed,
       * we can set the liveInterval to a high value
       */
      liveInterval: 1000 * 60 * 10, // 10 minutes
      deletedFlag: 'deleted'
    })

    replicationState.error$.subscribe(err => {
      console.error('replication error:')
      console.dir(err)
    })
    return replicationState
  }

  async setupGraphQLSubscription(auth, replicationState) {
    const endpointURL = 'ws://' + syncURL
    const wsClient = new SubscriptionClient(endpointURL, {
      reconnect: true,
      connectionParams: {
        headers: {
          Authorization: `Bearer ${auth.idToken}`
        }
      },
      timeout: 1000 * 60,
      onConnect: () => {
        console.log('SubscriptionClient.onConnect()')
      },
      connectionCallback: () => {
        console.log('SubscriptionClient.connectionCallback:')
      },
      reconnectionAttempts: 10000,
      inactivityTimeout: 10 * 1000,
      lazy: true
    })

    const query = `subscription onPageChanged {
      page {
        id
        title
        content
        order
        updatedAt
        deleted
      }       
    }`

    const ret = wsClient.request({ query })

    ret.subscribe({
      next: async (data) => {
        console.log('subscription emitted => trigger run')
        console.dir(data)
        await replicationState.run()
        console.log('run done')
        store.commit('setLoading', false)
      },
      error(error) {
        console.log('run got error:')
        console.dir(error)
      }
    })

    if (store.getters.isAuth) {
      await replicationState.awaitInitialReplication()
    }

    return wsClient
  }
}

export const createDb = async () => {
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('DatabaseService: removing database..')
  //   await removeRxDatabase('vuenotiontiptap', 'idb')
  // }
  console.log('DatabaseService: creating database..')
  const db = await createRxDatabase({
    name: 'vuenotiontiptap',
    adapter: 'idb',
    ignoreDuplicate: true,
    queryChangeDetection: true
  })

  console.log('DatabaseService: created database')
  window.db = db

  console.log('DatabaseService: create collections')
  await db.addCollections(collections)

  return db
}

export const removeDb = async () => {
  console.log('DatabaseService: removing database..')
  await removeRxDatabase('vuenotiontiptap', 'idb')
}
