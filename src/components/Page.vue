<template>
  <div class="w-1/2 mx-auto mt-8">
    <div v-if="page.id">
      <block v-for="block in page.blocks"
        :key="block.id" :block="block"/>
    </div>
    <div v-else>
      <h1 class="mb-4 text-2xl">No Page Selected</h1>
      <div>Select a page or create new page</div>
    </div>
  </div>
</template>

<script>
import Block from './Block'

export default {
  name: 'Page',
  components: { Block },
  data() {
    return {
      page: {}
    }
  },
  watch: {
    '$route' (to, from) {
      if (this.$route.params.pageId) {
        this.viewPage(this.$route.params.pageId)
      }
    }
  },
  mounted() {
    if (this.$route.params.pageId) {
      this.viewPage(this.$route.params.pageId)
    }
  },
  methods: {
    viewPage(pageId) {
      this.$db.pages.findOne({ selector: { id: { $eq: pageId } } })
        .exec().then((page) => { this.page = page })
    }
  }
}
</script>
