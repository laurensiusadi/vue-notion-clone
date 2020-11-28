<template>
  <component
    :is="block.blockType"
    :data-index="index"
    :data-block-id="block.id"
  >
    <span
      ref="content"
      class="editable"
      :placeholder="placeholder"
      :contenteditable="true"
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
  props: {
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
        this.$refs.content.innerHTML = this.block.text
        this.putCaretOnPos(this.$refs.content, pos)
      }
    },
    onBlur(event) {
      if (event.target.textContent.length > 0 && event.target.textContent !== this.block.text) {
        this.updateBlock(event.target.textContent.trim())
      } else {
        this.$refs.content.textContent = this.block.text
      }
      this.$refs.content.innerHTML = this.parseLink(event.target.textContent.trim())
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
      console.log('moveFocusToIndex', index, el)
      this.putCaretOnPos(el, atStart ? 0 : el.textContent.length)
    },
    onKeydown(evt) {
      switch (evt.key) {
        case 'Enter': {
          evt.preventDefault()
          const pos = this.getCaretPos(evt)
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
          evt.preventDefault()
          if (this.index > 0) {
            this.moveFocusToIndex(this.index - 1, false)
          }
          break
        }
        case 'ArrowDown': {
          evt.preventDefault()
          if (this.index < this.page.blocks.length - 1) {
            this.moveFocusToIndex(this.index + 1, true)
          }
          break
        }
        case 'ArrowRight': {
          const pos = this.getCaretPos(evt)
          if (pos === this.block.text.length &&
            this.index < this.page.blocks.length - 1) {
            evt.preventDefault()
            this.moveFocusToIndex(this.index + 1, true)
          }
          break
        }
        case 'ArrowLeft': {
          const pos = this.getCaretPos(evt)
          if (pos === 0 && this.index > 0) {
            evt.preventDefault()
            this.moveFocusToIndex(this.index - 1, false)
          }
          break
        }
        case 'Backspace': {
          const pos = this.getCaretPos(evt)
          if (this.index > 0 && this.$refs.content.textContent.length === 0) {
            evt.preventDefault()
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
          const pos = this.getCaretPos(evt)
          const currentBlockText = this.block.text
          if (this.index < this.page.blocks.length - 1 &&
            pos === currentBlockText.length) {
            evt.preventDefault()
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
  min-height: 1.75rem;
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
