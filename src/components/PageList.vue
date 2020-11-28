<template>
  <div class="w-64 bg-gray-100 min-w-32">
    <div class="w-full px-2 py-2">
      <button class="block w-full py-2 text-white bg-green-500 rounded-full hover:bg-green-600" @click="createPage">New Page</button>
    </div>
    <div>
      <div v-for="page in pages"
        :key="page.id"
        :data-id="page.id"
        class="px-2 py-2 cursor-pointer hover:bg-gray-300"
        :class="{ 'bg-gray-200': isPageActive(page.id) }"
        @click="viewPage(page.id)"
      >
        <h3>{{ page.blocks[0].text }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectID from 'bson-objectid'

export default {
  name: 'PageList',
  data() {
    return {
      pages: []
    }
  },
  mounted() {
    this.$db.pages.find().sort('createdAt')
      .$.subscribe(pages => {
        if (!pages) { return }
        this.pages = pages
      })
  },
  methods: {
    createPage() {
      const pageId = ObjectID().toString()
      this.$db.pages.insert({
        id: pageId,
        blocks: [
          {
            id: ObjectID().toString(),
            text: 'Untitled Page',
            blockType: 'h1',
            createdAt: new Date().toISOString(),
            pageId: pageId,
            userId: 'user1'
          },
          {
            id: ObjectID().toString(),
            text: '',
            blockType: 'p',
            createdAt: new Date().toISOString(),
            pageId: pageId,
            userId: 'user1'
          }
        ],
        createdAt: new Date().toISOString(),
        userId: 'user1'
      }).then(() => {
        this.$nextTick(() => {
          this.viewPage(pageId)
        })
      })
    },
    viewPage(pageId) {
      if (this.$route.params.pageId !== pageId) {
        this.$router.push({ path: `/app/${pageId}` })
      }
    },
    isPageActive(pageId) {
      if (this.$route.params.pageId) {
        return this.$route.params.pageId === pageId
      }
      return false
    }
  }
}
</script>
