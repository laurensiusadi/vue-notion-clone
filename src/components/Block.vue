<template>
  <component :is="block.blockType">
    <editable
      :content="block.text"
      @update="updateBlock"
      placeholder="Enter text here"
    />
  </component>
</template>

<script>
import Editable from './Editable'

export default {
  name: 'Block',
  components: { Editable },
  props: {
    block: {
      type: Object
    },
    page: {
      type: Object
    }
  },
  methods: {
    updateBlock(val) {
      const blocks = this.page.blocks.map(block => {
        if (block.id === this.block.id) {
          block.text = val
        }
        return block
      })
      this.page.update({
        $set: {
          blocks: blocks
        }
      })
    }
  }
}
</script>
