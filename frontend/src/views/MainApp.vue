<template>
  <div class="flex w-full max-h-screen min-h-screen overflow-x-hidden">
    <PageList/>
    <PageEditor/>
  </div>
</template>

<script>
import PageEditor from '../components/PageEditor'
import PageList from '../components/PageList'

export default {
  name: 'MainApp',
  components: { PageEditor, PageList }
}
</script>
