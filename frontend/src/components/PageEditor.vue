<template>
  <div class="page">
    <div v-if="page">
      <editable ref="headline" type="text" class="page-block page-heading"
        :content="page.title" @update="updatePageTitle" placeholder="Untitled Note"/>
      <editor
          :value="page.content"
          @input="savePage"
          :pageId="page.id"
        />
    </div>
    <div v-else>
      <h1 class="page-block page-heading">No Page Selected</h1>
      <div class="page-block">Select a page or create new page</div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

import Editable from '@/components/Editable'
import Editor from '@/components/editor/Editor'

export default {
  name: 'PageEditor',
  components: { Editable, Editor },
  props: ['db'],
  data() {
    return {
      page: null,
      status: '',
      pageChanged: false
    }
  },
  watch: {
    '$route' (to, from) {
      if (this.$route.params.pageId) {
        this.viewPage(this.$route.params.pageId)
      } else {
        this.page = null
      }
    },
    'page.id'() {
      this.pageChanged = false
      this.status = ''
    }
  },
  mounted() {
    if (this.$route.params.pageId) {
      this.viewPage(this.$route.params.pageId)
    }
  },
  methods: {
    viewPage(pageId) {
      this.db.pages.findOne({ selector: { id: { $eq: pageId } } })
        .exec().then((page) => {
          if (!page) { return }
          this.page = page
        })
    },
    updatePageTitle(val) {
      if (val) {
        this.page.update({ $set: { title: val } })
      } else {
        this.page.update({ $set: { title: 'Untitled Note' } })
      }
    },
    savePage: debounce(
      function(val) {
        this.status = 'Saving'
        this.page.update({ $set: { content: val } })
          .then(() => { this.status = 'Saved' })
      }, 800, { maxWait: 10000 }
    )
  }
}
</script>
