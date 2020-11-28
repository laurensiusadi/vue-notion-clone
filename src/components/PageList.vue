<template>
  <div class="w-64 bg-gray-100 min-w-32">
    <div class="w-full px-2 py-2">
      <button class="block w-full py-2 text-white bg-green-500 rounded-full hover:bg-green-600" @click="createPage">New Page</button>
    </div>
    <draggable
      v-model="orderedPages"
      v-bind="{
        handle: '.drag-handle',
        animation: 200
      }"
    >
      <div v-for="page in orderedPages"
        :key="page.id"
        :data-id="page.id"
        class="flex px-2 py-2 cursor-pointer hover:bg-gray-300 page-list"
        :class="{ 'bg-gray-200': isPageActive(page.id) }"
        @click="viewPage(page.id)"
      >
        <h3 class="flex-1">{{ page.blocks[0].text }}</h3>
        <div class="hover:bg-gray-100 drag-handle">
          <img src="@/assets/icons/icon-drag-handle.svg"/>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import ObjectID from 'bson-objectid'

export default {
  name: 'PageList',
  components: {
    draggable
  },
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
  computed: {
    orderedPages: {
      get() {
        return [...this.pages].sort((a, b) => a.order - b.order)
      },
      set(pages) {
        pages.map((page, index) => {
          page.update({ $set: { order: index } })
        })
      }
    }
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
