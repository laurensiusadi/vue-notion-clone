<template>
  <div class="w-full mt-40 page">
    <div v-if="page" class="w-1/2 mx-auto">
      <block
        :draggable="false"
        :key="page.blocks[0].id"
        :index="0"
        :block="page.blocks[0]"
        :page="page"
        :readonly="readonly"
        :isSelecting="isSelecting"
        :otherSelected="otherSelected"
        @blur="onBlur"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      />
      <draggable
        v-model="pageBlocks"
        v-bind="{
          handle: '.drag-handle',
          animation: 200
        }"
      >
        <block v-for="(block, index) in pageBlocks"
          :draggable="true"
          :key="block.id"
          :index="index + 1"
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
      </draggable>
    </div>
    <div v-else class="w-1/2 mx-auto">
      <h1 class="mb-4 text-2xl">No Page Selected</h1>
      <div>Select a page or create new page</div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Block from './Block'

export default {
  name: 'Page',
  components: {
    draggable, Block
  },
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
  computed: {
    pageBlocks: {
      get() {
        return this.page.blocks.slice(1)
      },
      set(value) {
        this.page.update({ $set: { blocks: [this.page.blocks[0], ...value] } })
      }
    }
  },
  methods: {
    viewPage(pageId) {
      this.$db.pages.findOne({ selector: { id: { $eq: pageId } } })
        .exec().then((page) => {
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
