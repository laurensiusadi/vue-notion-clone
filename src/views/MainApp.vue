<template>
  <div>
    <h1>Main App</h1>
    <div style="display:flex;border-bottom: 1px solid lightgrey; padding-bottom: 8px;">
      <div style="margin-right: 8px; white-space: nowrap;">{{ newTodo.isCompleted ? '[x] ' : '[ ] ' }}</div>
      <editable :content="newTodo.text" placeholder="Untitled todo"/>
    </div>
    <div style="display:flex; padding: 4px 0;" v-for="todo in todos" :key="todo.id" >
      <div style="margin-right: 8px; white-space: nowrap;" @click="toggleTodo(todo)">{{ todo.isCompleted ? '[x]' : '[ ]' }}</div>
      <editable :content="todo.text" @update="updateTodo(todo, $event)" :linkify="true"/>
    </div>
  </div>
</template>

<script>
import Editable from '../components/Editable'

export default {
  name: 'MainApp',
  components: { Editable },
  data() {
    return {
      newTodo: {
        isCompleted: false,
        text: ''
      },
      todos: []
    }
  },
  mounted() {
    this.$db.todos.find().sort('createdAt')
      .$.subscribe(todos => {
        if (!todos) { return }
        this.todos = todos
      })
  },
  methods: {
    toggleTodo(todo) {
      todo.update({ $set: { isCompleted: !todo.isCompleted } })
    },
    updateTodo(todo, val) {
      todo.update({ $set: { text: val } })
    }
  }
}
</script>
