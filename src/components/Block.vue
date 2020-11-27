<template>
  <div>
    <editable :content="'Text here'"/>
  </div>
</template>

<script>
import Editable from './Editable'

export default {
  name: 'Block',
  components: { Editable }
}
</script>