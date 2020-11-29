<template>
  <component
    :is="blockComponent"
    :class="[block.blockType, { 'completed': block.isCompleted }]"
    :data-index="index"
    :data-block-id="block.id"
    class="relative flex px-4 page-block"
    @mousedown="$emit('mousedown')"
    @mousemove="$emit('mousemove')"
    @mouseup="$emit('mouseup')"
  >
    <div class="control-wrapper">
      <v-popover placement="left" :open="menuOpen" @apply-hide="setMenuOpen(false)">
        <div :class="{ 'drag-handle': draggable, 'menu-open': menuOpen }"
          @click="setMenuOpen(true)"
        >
          <img v-show="draggable" src="@/assets/icons/icon-drag-handle.svg"/>
        </div>
        <template slot="popover">
          <block-menu @update-block="updateBlock"/>
        </template>
      </v-popover>
    </div>
    <div
      v-if="showBlockPrefix"
      class=block-prefix
      @click.prevent="toggleCheckbox"
    >
      <span class="content">{{ blockPrefixContent }}</span>
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
import BlockMenu from './BlockMenu'

export default {
  name: 'Block',
  components: { BlockMenu },
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
      } else {
        switch (this.block.blockType) {
          case 'heading-block':
            return 'Heading 1'
          case 'sub-heading-block':
            return 'Heading 2'
          case 'sub-sub-heading-block':
            return 'Heading 3'
          case 'to-do-block':
            return 'To-do'
          case 'bulleted-list-block':
          case 'numbered-list-block':
            return 'List'
          case 'quote-block':
            return 'Empty quote'
        }
      }
      return 'Type \'/\' for commands'
    },
    blockComponent() {
      switch (this.block.blockType) {
        case 'code-block':
          return 'code'
        case 'quote-block':
          return 'blockquote'
        default:
          return 'div'
      }
    },
    showBlockPrefix() {
      switch (this.block.blockType) {
        case 'to-do-block':
        case 'bulleted-list-block':
        case 'numbered-list-block':
          return true
        default:
          return false
      }
    },
    blockPrefixContent() {
      switch (this.block.blockType) {
        case 'bulleted-list-block':
          return '•'
        case 'numbered-list-block': {
          if (this.index > 1) {
            const prevBlock = document.querySelector(`[data-index="${this.index - 1}"]`)
            if (prevBlock.classList.contains('numbered-list-block')) {
              const prevNum = document.querySelector(`[data-index="${this.index - 1}"] .block-prefix .content`).textContent
              return `${parseInt(prevNum[0]) + 1}.`
            }
          }
          return '1.'
        }
        default:
          return ''
      }
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
      this.updateBlock('text', event.target.textContent)
      this.$refs.content.innerHTML = this.parseLink(event.target.textContent.trim())
      this.$emit('blur')
    },
    updateBlock(key, val) {
      const blocks = this.page.blocks.map(block => {
        if (block.id === this.block.id) {
          block[key] = val
        }
        return block
      })
      this.page.update({ $set: { blocks: blocks } })
    },
    resetBlock() {
      this.$refs.content.textContent = ''
      this.$refs.content.focus()
    },
    moveFocusToIndex(index, atStart) {
      const el = document.querySelector(`[data-index="${index}"] .editable`)
      this.putCaretOnPos(el, atStart ? 0 : el.textContent.length)
    },
    onKeydown(event) {
      const currentText = this.$refs.content.textContent
      switch (event.key) {
        case 'Enter': {
          event.preventDefault()
          const pos = this.getCaretPos(event)
          let blocks = this.page.blocks
          let newBlock
          let newBlockType
          const blockTypeIsList = this.block.blockType === 'to-do-block' ||
            this.block.blockType === 'bulleted-list-block' ||
            this.block.blockType === 'numbered-list-block'
          if (blockTypeIsList) {
            if (currentText.length === 0) {
              this.updateBlock('blockType', 'text-block')
              break
            }
            newBlockType = this.block.blockType
          } else {
            newBlockType = 'text-block'
          }
          if (pos === this.page.blocks.length) {
            // Add new block after this block
            newBlock = {
              id: ObjectID().toString(),
              text: '',
              blockType: newBlockType,
              createdAt: new Date().toISOString(),
              pageId: this.page.id,
              userId: 'user1'
            }
          } else {
            // Split current block into new block
            blocks[this.index].text = currentText.slice(0, pos)
            newBlock = {
              id: ObjectID().toString(),
              text: currentText.slice(pos, currentText.length),
              blockType: newBlockType,
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
          if (pos === currentText.length &&
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
          if (this.menuOpen && currentText.length === 1) {
            this.menuOpen = false
          }
          if (this.index > 0 && currentText.length === 0) {
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
          if (this.index > 0 && this.index < this.page.blocks.length - 1 &&
            pos === currentText.length) {
            event.preventDefault()
            let blocks = this.page.blocks
            blocks[this.index].text = currentText + blocks[this.index + 1].text
            blocks = blocks.filter(block => block.id !== blocks[this.index + 1].id)
            const el = document.querySelector(`[data-index="${this.index}"] .editable`)
            this.page.update({ $set: { blocks: blocks } })
              .then(() => { this.putCaretOnPos(el, currentText.length) })
          }
          break
        }
        case '/': {
          if (currentText.length === 0) {
            this.setMenuOpen(true)
          }
          break
        }
        case ' ': {
          switch (currentText) {
            case '#': {
              event.preventDefault()
              this.updateBlock('blockType', 'heading-block')
              this.resetBlock()
              console.log('Heading 1')
              break
            }
            case '##': {
              event.preventDefault()
              this.updateBlock('blockType', 'sub-heading-block')
              this.resetBlock()
              console.log('Heading 2')
              break
            }
            case '###': {
              event.preventDefault()
              this.updateBlock('blockType', 'sub-sub-heading-block')
              this.resetBlock()
              console.log('Heading 3')
              break
            }
            case '[[': {
              console.log('Page')
              break
            }
            case '[]':
            case '[ ]': {
              event.preventDefault()
              this.updateBlock('blockType', 'to-do-block')
              this.resetBlock()
              console.log('To-do list')
              break
            }
            case '-':
            case '-.': {
              event.preventDefault()
              this.updateBlock('blockType', 'bulleted-list-block')
              this.resetBlock()
              console.log('Bulleted list')
              break
            }
            case '1.': {
              event.preventDefault()
              this.updateBlock('blockType', 'numbered-list-block')
              this.resetBlock()
              console.log('Numbered list')
              break
            }
            case '```': {
              event.preventDefault()
              this.updateBlock('blockType', 'code-block')
              this.resetBlock()
              console.log('Code')
              break
            }
            case '|': {
              event.preventDefault()
              this.updateBlock('blockType', 'quote-block')
              this.resetBlock()
              console.log('Quote')
              break
            }
          }
          break
        }
      }
    },
    setMenuOpen(bool) {
      this.menuOpen = bool
      this.$emit('menu-open', bool)
    },
    toggleCheckbox() {
      if (this.block.blockType !== 'to-do-block') return
      const bool = typeof this.block.isCompleted !== 'undefined'
        ? !this.block.isCompleted : true
      this.updateBlock('isCompleted', bool)
    }
  }
}
</script>

<style lang="scss">
.editable {
  display: block;
  flex: 1;
  min-height: 24px;
  &:focus {
    outline: none;
  }
  &:empty::before {
    content: attr(placeholder);
    display: block;
    font: inherit;
    color: rgba(55, 53, 47, 0.4);
  }
}

.text-block .editable {
  &:empty::before {
    display: none;
  }
  &:focus:empty::before {
    display: block;
  }
}

</style>
