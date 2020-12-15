import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core'
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

const syncURL = 'http://localhost:8080/v1/graphql'

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
            pages(
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
        }){
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
    if (this.replicationState) {
      this.replicationState.cancel()
    }
    if (this.subscriptionClient) {
      this.subscriptionClient.close()
    }
    this.replicationState = await this.setupGraphQLReplication(auth)
    this.subscriptionClient = this.setupGraphQLSubscription(auth, this.replicationState)
  }

  async setupGraphQLReplication(auth) {
    const replicationState = this.db.collections.pages.syncGraphQL({
      url: syncURL,
      headers: {
        Authorization: `Bearer ${auth.idToken}`
      },
      push: {
        batchSize,
        queryBuilder: pushQueryBuilder
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

  setupGraphQLSubscription(auth, replicationState) {
    const endpointURL = 'wss://localhost:8080/v1/graphql'
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
        pages {
            id
            title
            content
            order
            deleted
        }       
    }`

    const ret = wsClient.request({ query })

    ret.subscribe({
      next(data) {
        console.log('subscription emitted => trigger run')
        console.dir(data)
        replicationState.run()
      },
      error(error) {
        console.log('got error:')
        console.dir(error)
      }
    })

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
    password: 'myPassword',
    ignoreDuplicate: true,
    queryChangeDetection: true
  })

  console.log('DatabaseService: created database')
  window.db = db

  console.log('DatabaseService: create collections')
  await db.addCollections(collections)

  return db
}
