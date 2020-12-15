<template>
  <div class="flex w-full max-h-screen min-h-screen overflow-x-hidden">
    <PageList v-if="db" :db="db"/>
    <PageEditor v-if="!isLoading && db" :db="db"/>
  </div>
</template>

<script>
import * as Database from '../services/Database'
import PageEditor from '../components/PageEditor'
import PageList from '../components/PageList'

export default {
  name: 'MainApp',
  components: { PageEditor, PageList },
  data() {
    return {
      db: null,
      graphqlReplicator: null
    }
  },
  computed: {
    isLoading() {
      return this.$store.state.isLoading
    }
  },
  watch: {
    async '$store.getters.isAuth'(val) {
      if (val && this.graphqlReplicator) {
        await this.graphqlReplicator.restart({ userId: this.$store.getters.getUser.id, idToken: this.$store.state.authToken })
      }
    }
  },
  async mounted() {
    this.db = await Database.createDb()
    this.graphqlReplicator = new Database.GraphQLReplicator(this.db)
    if (this.$store.getters.isAuth) {
      await this.graphqlReplicator.restart({ userId: this.$store.getters.getUser.id, idToken: this.$store.state.authToken })
      this.db.pages.find({
        selector: {
          userId: { $eq: this.$store.getters.getUser.id }
        }
      }).sort('createdAt')
        .$.subscribe(pages => {
          if (!pages) { return }
          this.$store.commit('setPages', pages)
        })
    } else {
      this.db.pages.find().sort('createdAt')
        .$.subscribe(pages => {
          if (!pages) { return }
          this.$store.commit('setPages', pages)
        })
    }
  }
}
</script>
