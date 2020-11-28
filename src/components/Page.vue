<template>
  <div class="w-full mt-40 page">
    <div v-if="page" class="w-1/2 mx-auto">
      <block v-for="(block, index) in page.blocks"
        :key="block.id"
        :index="index"
        :block="block"
        :page="page"
        :readonly="readonly"
        :isSelecting="isSelecting"
        :otherSelected="otherSelected"
        @blur="onBlur"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      />
    </div>
    <div v-else class="w-1/2 mx-auto">
      <h1 class="mb-4 text-2xl">No Page Selected</h1>
      <div>Select a page or create new page</div>
    </div>
  </div>
</template>

<script>
import Block from './Block'

export default {
  name: 'Page',
  components: { Block },
  data() {
    return {
      readonly: false,
      isMouseDown: false,
      isMouseMove: false,
      isSelecting: false,
      otherSelected: false,
      page: null
    }
  },
  watch: {
    '$route' (to, from) {
      if (this.$route.params.pageId) {
        this.viewPage(this.$route.params.pageId)
      }
    }
  },
  mounted() {
    if (this.$route.params.pageId) {
      this.viewPage(this.$route.params.pageId)
    }
  },
  methods: {
    viewPage(pageId) {
      this.$db.pages.findOne({ selector: { id: { $eq: pageId } } })
        .$.subscribe((page) => {
          if (!page) { return }
          this.page = page
        })
    },
    onBlur() {
      this.isSelecting = false
    },
    onMouseDown() {
      this.isSelecting = false
      this.readonly = false
      this.isMouseDown = true
    },
    onMouseMove() {
      this.otherSelected = document.querySelectorAll('.selectable').length >= 2
      if (this.isMouseDown && this.isMouseMove) {
        this.isSelecting = true
        this.readonly = true
      }
      this.isMouseMove = true
    },
    onMouseUp() {
      this.isSelecting = false
      this.isMouseDown = false
      this.isMouseMove = false
      this.readonly = false
    }
  }
}
</script>
