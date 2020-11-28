<template>
  <component
    :is="block.blockType"
    :data-index="index"
    :data-block-id="block.id"
    class="relative px-4 page-block"
    @mousedown="$emit('mousedown')"
    @mousemove="$emit('mousemove')"
    @mouseup="$emit('mouseup')"
  >
    <div class="absolute">
      <v-popover placement="left" offset="8" :open="menuOpen" @apply-hide="menuOpen=false">
        <div class="absolute hover:bg-gray-100"
          :class="{ 'drag-handle': draggable, 'menu-open': menuOpen }"
          @click="menuOpen=true"
        >
          <img v-show="draggable" src="@/assets/icons/icon-drag-handle.svg"/>
        </div>
        <template slot="popover">
          Menus here
        </template>
      </v-popover>
    </div>
    <span
      ref="content"
      class="editable"
      :class="{ 'selectable': isSelected, 'selected': isSelected && otherSelected }"
      :placeholder="placeholder"
      :contenteditable="!readonly"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    >
    </span>
  </component>
</template>

<script>
import ObjectID from 'bson-objectid'

export default {
  name: 'Block',
  data() {
    return {
      menuOpen: false,
      isSelected: false
    }
  },
  props: {
    draggable: {
      type: Boolean
    },
    isSelecting: {
      type: Boolean
    },
    otherSelected: {
      type: Boolean
    },
    readonly: {
      type: Boolean
    },
    block: {
      type: Object
    },
    page: {
      type: Object
    },
    index: {
      type: Number
    }
  },
  computed: {
    placeholder() {
      if (this.index === 0) {
        return 'Untitled'
      }
      return 'Type \'/\' for commands'
    }
  },
  mounted() {
    this.$refs.content.innerHTML = this.parseLink(this.block.text)

    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection()
      const el = this.$refs.content
      if (el) {
        const found = selection.containsNode(el, true)
        if (this.isSelecting) {
          this.isSelected = found
        } else {
          this.isSelected = false
        }
      }
    })
  },
  watch: {
    'block.text'(val) {
      this.$refs.content.textContent = val
    }
  },
  methods: {
    parseLink(str) {
      if (this.linkify) {
        return str.replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[\da-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,]*))/gi, "<a href='$1' target='_blank' rel='noopener noreferrer nofollow'>$1</a>")
      }
      return str
    },
    getCaretPos(event) {
      if (typeof window.getSelection !== 'undefined' &&
        typeof document.createRange !== 'undefined') {
        const _range = window.getSelection().getRangeAt(0)
        const range = _range.cloneRange()
        range.selectNodeContents(event.target)
        range.setEnd(_range.endContainer, _range.endOffset)
        return range.endOffset // Number
      }
      return 0
    },
    putCaretOnPos(el, pos) {
      const range = document.createRange()
      const selection = window.getSelection()
      const textLength = el.textContent.trim().length
      const node = textLength > 0 ? el.childNodes[0] : el
      try {
        range.setStart(node, pos)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      } catch (e) {
        console.log('caret err')
      }
    },
    onFocus(event) {
      if (event.target.value) {
        const pos = this.getCaretPos(event)
        this.$refs.content.textContent = this.block.text
        this.putCaretOnPos(this.$refs.content, pos)
      }
    },
    onBlur(event) {
      if (event.target.textContent.length > 0 && event.target.textContent !== this.block.text) {
        this.updateBlock(event.target.textContent)
      } else {
        this.$refs.content.textContent = this.block.text
      }
      this.$refs.content.innerHTML = this.parseLink(event.target.textContent.trim())
      this.$emit('blur')
    },
    updateBlock(val) {
      const blocks = this.page.blocks.map(block => {
        if (block.id === this.block.id) {
          block.text = val
        }
        return block
      })
      this.page.update({ $set: { blocks: blocks } })
    },
    moveFocusToIndex(index, atStart) {
      const el = document.querySelector(`[data-index="${index}"] .editable`)
      this.putCaretOnPos(el, atStart ? 0 : el.textContent.length)
    },
    onKeydown(event) {
      switch (event.key) {
        case 'Enter': {
          event.preventDefault()
          const pos = this.getCaretPos(event)
          let blocks = this.page.blocks
          let newBlock
          if (pos === this.page.blocks.length) {
            // Add new block after this block
            newBlock = {
              id: ObjectID().toString(),
              text: '',
              blockType: 'p',
              createdAt: new Date().toISOString(),
              pageId: this.page.id,
              userId: 'user1'
            }
          } else {
            // Split current block into new block
            blocks[this.index].text = this.block.text.slice(0, pos)
            newBlock = {
              id: ObjectID().toString(),
              text: this.block.text.slice(pos, this.block.text.length),
              blockType: 'p',
              createdAt: new Date().toISOString(),
              pageId: this.page.id,
              userId: 'user1'
            }
          }
          blocks = [
            ...blocks.slice(0, this.index + 1),
            newBlock,
            ...blocks.slice(this.index + 1)
          ]
          this.page.update({ $set: { blocks: blocks } })
            .then(() => this.moveFocusToIndex(this.index + 1, true))
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          if (this.index > 0) {
            this.moveFocusToIndex(this.index - 1, false)
          }
          break
        }
        case 'ArrowDown': {
          event.preventDefault()
          if (this.index < this.page.blocks.length - 1) {
            this.moveFocusToIndex(this.index + 1, true)
          }
          break
        }
        case 'ArrowRight': {
          const pos = this.getCaretPos(event)
          if (pos === this.block.text.length &&
            this.index < this.page.blocks.length - 1) {
            event.preventDefault()
            this.moveFocusToIndex(this.index + 1, true)
          }
          break
        }
        case 'ArrowLeft': {
          const pos = this.getCaretPos(event)
          if (pos === 0 && this.index > 0) {
            event.preventDefault()
            this.moveFocusToIndex(this.index - 1, false)
          }
          break
        }
        case 'Backspace': {
          const pos = this.getCaretPos(event)
          if (this.index > 0 && this.$refs.content.textContent.length === 0) {
            event.preventDefault()
            const blocks = this.page.blocks.filter(block => block.id !== this.block.id)
            this.page.update({ $set: { blocks: blocks } })
              .then(() => { this.moveFocusToIndex(this.index - 1, false) })
          } else if (pos === 0 && this.index > 1) {
            // Merge this block to previous
            let blocks = this.page.blocks
            const prevBlockText = blocks[this.index - 1].text
            blocks[this.index - 1].text = prevBlockText + blocks[this.index].text
            blocks = blocks.filter(block => block.id !== blocks[this.index].id)
            const el = document.querySelector(`[data-index="${this.index - 1}"] .editable`)
            this.page.update({ $set: { blocks: blocks } })
              .then(() => { this.putCaretOnPos(el, prevBlockText.length) })
          }
          break
        }
        case 'Delete': {
          const pos = this.getCaretPos(event)
          const currentBlockText = this.block.text
          if (this.index < this.page.blocks.length - 1 &&
            pos === currentBlockText.length) {
            event.preventDefault()
            let blocks = this.page.blocks
            blocks[this.index].text = currentBlockText + blocks[this.index + 1].text
            blocks = blocks.filter(block => block.id !== blocks[this.index + 1].id)
            const el = document.querySelector(`[data-index="${this.index}"] .editable`)
            this.page.update({ $set: { blocks: blocks } })
              .then(() => { this.putCaretOnPos(el, currentBlockText.length) })
          }
          break
        }
      }
    }
  }
}
</script>

<style lang="scss">
.editable {
  display: block;
  min-height: 24px;
  &:focus {
    outline: none;
  }
  &:focus:empty:before {
    content: attr(placeholder);
    display: block;
    font: inherit;
    color: rgba(55, 53, 47, 0.4);
  }
}

</style>
