<template>
  <div class="flex min-h-screen">
    <PageList :pages="pages"/>
    <Page/>
  </div>
</template>

<script>
import Page from '../components/Page'
import PageList from '../components/PageList'

export default {
  name: 'MainApp',
  components: { Page, PageList },
  data() {
    return {
      pages: []
    }
  },
  mounted() {
    this.$db.pages.find().sort('createdAt')
      .$.subscribe(pages => {
        if (!pages) { return }
        this.pages = pages
      })
  },
  methods: {
    // toggleTodo(todo) {
    //   todo.update({ $set: { isCompleted: !todo.isCompleted } })
    // },
    // updateTodo(todo, val) {
    //   todo.update({ $set: { text: val } })
    // }
  }
}
</script>
