<template>
  <div class="page"
    :class="{ 'menu-is-open': isMenuOpen }"
  >
    <div v-if="page">
      <block
        class="page-heading"
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
          :blockPrefixContent="getBlockPrefixContent(block, index)"
          @blur="onBlur"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @menu-open="setMenuOpen"
        />
      </draggable>
    </div>
    <div v-else>
      <h1 class="page-block page-heading">No Page Selected</h1>
      <div class="page-block">Select a page or create new page</div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Block from './Block'

let numbering = 1

export default {
  name: 'Page',
  components: {
    draggable, Block
  },
  data() {
    return {
      readonly: false,
      isMenuOpen: false,
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
      } else {
        this.page = null
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
    },
    getBlockPrefixContent() {
      return (block, index) => {
        if (block.blockType === 'numbered-list-block') {
          numbering += 1
          return numbering - 1 + '.'
        } else if (block.blockType === 'bulleted-list-block') {
          numbering = 1
          return '•'
        } else {
          numbering = 1
          return ''
        }
      }
    }
  },
  methods: {
    viewPage(pageId) {
      this.db.pages.findOne({ selector: { id: { $eq: pageId } } })
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
    },
    setMenuOpen(val) {
      this.isMenuOpen = val
    }
  }
}
</script>
