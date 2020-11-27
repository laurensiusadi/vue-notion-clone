<template>
  <div>
    <h1>Main App</h1>
    <div v-for="todo in todos" :key="todo.id" @click="toggleTodo(todo)">
      {{ todo.isCompleted ? '[x]' : '[ ]' }} {{ todo.text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainApp',
  data() {
    return {
      todos: [],
      subs: []
    }
  },
  mounted() {
    const todosSub = this.$db.todos.find().sort('createdAt')
      .$.subscribe(todos => {
        if (!todos) { return }
        this.todos = todos
      })

    this.subs.push(todosSub)
  },
  beforeDestroy() {
    this.subs.forEach(sub => sub.unsubsribe())
    this.subs = []
  },
  methods: {
    toggleTodo(todo) {
      todo.update({
        $set: {
          isCompleted: !todo.isCompleted
        }
      })
    }
  }
}
</script>
