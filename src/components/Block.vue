<template>
  <div>
    <editable :content="block.text"/>
  </div>
</template>

<script>
import Editable from './Editable'

export default {
  name: 'Block',
  props: {
    block: {
      type: Object
    }
  },
  components: { Editable }
}
</script>
