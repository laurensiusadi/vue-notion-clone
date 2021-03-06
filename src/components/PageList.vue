<template>
  <div class="sidebar" :class="{ 'active': isSidebarActive }">
    <div class="toggle" @click="isSidebarActive=!isSidebarActive">
      <svg viewBox="0 0 14 14" style="width: 14px; height: 14px; display: block; fill: rgba(55, 53, 47, 0.8); flex-shrink: 0; backface-visibility: hidden;" class="doubleChevronRight"><path d="M7 12.025L8.225 13.25L14 7.125L8.225 1L7 2.225L11.55 7.125L7 12.025ZM0 12.025L1.225 13.25L7 7.125L1.225 1L8.56743e-07 2.225L4.55 7.125L0 12.025Z"></path></svg>
    </div>
    <div class="flex flex-col w-64 max-h-screen min-h-screen bg-gray-100">
      <div class="w-full px-2 py-2">
        <button class="block w-full py-2 text-white bg-green-500 rounded-full hover:bg-green-600" @click="createPage">New Page</button>
      </div>
      <draggable
        class="flex-1 overflow-y-auto"
        v-model="orderedPages"
        v-bind="{
          handle: '.drag-handle',
          animation: 200
        }"
      >
        <div v-for="page in orderedPages"
          :key="page.id"
          :data-id="page.id"
          class="page-list"
          :class="{ 'bg-gray-200': isPageActive(page.id) }"
        >
          <h3 class="flex-1 py-2" @click="viewPage(page.id)">{{ page.blocks[0].text }}</h3>
          <v-popover placement="left-start" offset="-16" boundariesElement="body" :autoHide="true">
            <div class="mr-2 hover:bg-gray-100 drag-handle">
              <img src="@/assets/icons/icon-drag-handle.svg"/>
            </div>
            <template slot="popover">
              <page-list-menu :page="page"/>
            </template>
          </v-popover>
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import ObjectID from 'bson-objectid'
import PageListMenu from './PageListMenu'

export default {
  name: 'PageList',
  components: {
    draggable, PageListMenu
  },
  data() {
    return {
      isSidebarActive: true,
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
            blockType: 'heading-block',
            createdAt: new Date().toISOString(),
            pageId: pageId,
            userId: 'user1'
          },
          {
            id: ObjectID().toString(),
            text: '',
            blockType: 'text-block',
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
