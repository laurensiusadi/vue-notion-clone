<template>
  <div class="flex min-h-screen">
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
