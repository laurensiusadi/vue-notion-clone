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
    onFocus(event) {
      if (event.target.value) {
        const _range = document.getSelection().getRangeAt(0)
        const range = _range.cloneRange()
        range.selectNodeContents(event.target)
        range.setEnd(_range.endContainer, _range.endOffset)
        const pos = range.toString()

        this.$el.innerHTML = this.content

        const newRange = document.createRange()
        const selection = window.getSelection()
        const node = this.$el.childNodes[0]
        newRange.setStart(node, node && pos > node.length ? 0 : pos)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
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

<style lang="scss" scoped>
[contenteditable=true]:empty:before{
  content: attr(placeholder);
  display: block;
  font: inherit;
  color: #aaa;
}

.editable {
  display: block;
  &:focus {
    outline: none;
  }
}
</style>
