<template>
  <div class="flex w-full min-h-screen overflow-x-hidden">
    <PageList/>
    <Page/>
  </div>
</template>

<script>
import Page from '../components/Page'
import PageList from '../components/PageList'

export default {
  name: 'MainApp',
  components: { Page, PageList }
}
</script>
