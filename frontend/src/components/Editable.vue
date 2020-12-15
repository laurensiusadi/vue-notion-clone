<template>
  <span
    class="editable"
    :placeholder="placeholder"
    :contenteditable="!readonly"
    @focus="onFocus"
    @blur="onBlur"
    @keydown.enter.prevent="$event.target.blur"
    @keydown.esc.prevent="$event.target.blur"
  >
  </span>
</template>

<script>
export default {
  name: 'Editable',
  props: {
    content: String,
    placeholder: String,
    readonly: {
      type: Boolean,
      default: false
    },
    linkify: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    this.$el.innerHTML = this.parseLink(this.content)
  },
  watch: {
    content(val) {
      this.$el.textContent = val
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
      if (event.target.textContent.length > 0 && event.target.textContent !== this.content) {
        this.$emit('update', event.target.textContent.trim())
      } else {
        this.$el.textContent = this.content
      }
      this.$el.innerHTML = this.parseLink(event.target.textContent.trim())
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
    -webkit-text-fill-color: rgba(55, 53, 47, 0.2);
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
