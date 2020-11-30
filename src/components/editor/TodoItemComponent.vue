<template>
  <li :data-type="node.type.name" :data-done="node.attrs.done.toString()" data-drag-handle>
    <span class="todo-checkbox" contenteditable="false" @click="onChange"></span>
    <div class="todo-content" ref="content" :contenteditable="view.editable.toString()"></div>
  </li>
</template>

<script>
export default {
  name: 'TodoItemComponent',
  props: ['node', 'updateAttrs', 'view'],
  methods: {
    onChange() {
      this.updateAttrs({
        done: !this.node.attrs.done
      })
    }
  }
}
</script>

<style lang="scss">
li[data-type="todo_item"] {
  display: flex;
  &[data-done="true"], &:hover {
    .todo-checkbox::before {
      @apply relative text-sm h-4 leading-none block;
      top: -2px;
      content: '✓';
    }
  }
  &[data-done="true"] {
    .todo-content {
      @apply text-gray-400 line-through;
    }
    .todo-checkbox {
      @apply text-gray-400 border-gray-400;
    }
  }
}

.todo-checkbox {
  border: 2px solid #000;
  height: .9em;
  width: .9em;
  box-sizing: border-box;
  margin-right: 10px;
  margin-top: .5rem;
  user-select: none;
  cursor: pointer;
  border-radius: .2em;
}

.todo-content {
  flex: 1;
}
</style>
