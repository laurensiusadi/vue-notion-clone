<template>
  <div class="editor">
    <editor-menu-bubble v-if="editor && !archived" :editor="editor" @hide="hideLinkMenu" v-slot="{ commands, isActive, getMarkAttrs, menu }">
      <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <form class="menububble__form" v-if="linkMenuIsActive" @submit.prevent="setLinkUrl(commands.link, linkUrl)">
          <input
            class="menububble__input"
            type="text"
            :value="getMarkAttrs('link').href"
            placeholder="https://" ref="linkInput"
            @input="linkUrl = $event.target.value"
            @keydown.esc="hideLinkMenu"
          />
          <button class="menububble__button" @click="setLinkUrl(commands.link, null)" type="button">
            <icon name="remove" />
          </button>
        </form>

        <template v-else>
          <template v-if="isActive.table()">
            <button class="menububble__button" @click="commands.deleteTable">
              <icon name="delete_table" />
            </button>
            <button class="menububble__button" @click="commands.addColumnBefore">
              <icon name="add_col_before" />
            </button>
            <button class="menububble__button" @click="commands.addColumnAfter">
              <icon name="add_col_after" />
            </button>
            <button class="menububble__button" @click="commands.deleteColumn">
              <icon name="delete_col" />
            </button>
            <button class="menububble__button" @click="commands.addRowBefore">
              <icon name="add_row_before" />
            </button>
            <button class="menububble__button" @click="commands.addRowAfter">
              <icon name="add_row_after" />
            </button>
            <button class="menububble__button" @click="commands.deleteRow">
              <icon name="delete_row" />
            </button>
            <button class="menububble__button" @click="commands.toggleCellMerge">
              <icon name="combine_cells" />
            </button>
          </template>

          <button
            v-show="!isActive.paragraph()"
            class="menububble__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph"
          >
            <icon name="paragraph" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
            title="Blockquote"
          >
            <icon name="quote" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
            title="Heading Large"
          >
            H1
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
            title="Heading Large"
          >
            H2
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
            title="Heading Large"
          >
            H3
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
            title="Bold"
          >
            <icon name="bold" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
            title="Italic"
          >
            <icon name="italic" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
            title="Underline"
          >
            <icon name="underline" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike"
            title="Strikethrough"
          >
            <icon name="strike" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
            title="Inline Code"
          >
            <icon name="code" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
            title="Bullet List"
          >
            <icon name="ul" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
            title="Number List"
          >
            <icon name="ol" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.todo_list() }"
            @click="commands.todo_list"
            title="Todo List"
          >
            <icon name="checklist" />
          </button>

          <button
            class="menububble__button"
            @click="showLinkMenu(getMarkAttrs('link'))"
            :class="{ 'is-active': isActive.link() }"
          >
            <icon name="link" />
          </button>
        </template>
      </div>
    </editor-menu-bubble>
    <editor-floating-menu v-if="editor && !archived" :editor="editor" v-slot="{ commands, isActive, menu }">
      <div
        class="editor__floating-menu"
        :class="{ 'is-active': menu.isActive }"
        :style="`top: ${menu.top}px`"
      >
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 1 }) }"
          @click="commands.heading({ level: 1 })"
          title="Heading Large"
        >
          H1
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })"
          title="Heading Medium"
        >
          H2
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.todo_list() }"
          @click="commands.todo_list"
          title="Todo List"
        >
          <icon name="checklist" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bullet_list() }"
          @click="commands.bullet_list"
          title="Bullet List"
        >
          <icon name="ul" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.ordered_list() }"
          @click="commands.ordered_list"
          title="Number List"
        >
          <icon name="ol" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.image() }"
          @click="showImagePrompt(commands.image)"
          title="Image"
        >
          <icon name="image" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.code_block() }"
          @click="commands.code_block"
          title="Code Block"
        >
          <icon name="code" />
        </button>

        <button
          class="menubar__button"
          @click="commands.createTable({rowsCount: 3, colsCount: 3, withHeaderRow: false })"
          title="Table"
        >
          <icon name="table" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.blockquote() }"
          @click="commands.blockquote"
          title="Blockquote"
        >
          <icon name="quote" />
        </button>

      </div>
    </editor-floating-menu>
    <editor-content
      class="editor__content"
      v-if="editor"
      :editor="editor"
    />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorFloatingMenu, EditorMenuBubble } from 'tiptap'
import {
  Blockquote, Bold, BulletList, Code, CodeBlock,
  HardBreak, Heading, History, Image, Italic, Link, ListItem,
  OrderedList, Placeholder, Strike, Table, TableHeader,
  TableCell, TableRow, TodoList, Underline
} from 'tiptap-extensions'
import TodoItem from './TodoItem'
import Icon from './Icon'

export default {
  name: 'Editor',
  props: {
    value: String,
    pageId: String,
    archived: Boolean
  },
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble,
    Icon
  },
  data() {
    return {
      editor: null,
      linkUrl: null,
      linkMenuIsActive: false,
      editorConfig: {
        content: this.value,
        editable: !this.archived,
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Bold(),
          new Strike(),
          new Code(),
          new Italic(),
          new Link(),
          new Underline(),
          new History(),
          new Image(),
          new Placeholder({
            emptyClass: 'is-empty',
            emptyNodeText: 'Write something …',
            showOnlyWhenEditable: true
          }),
          new Table({ resizable: true }),
          new TableHeader(),
          new TableCell(),
          new TableRow()
        ],
        onUpdate: ({ getHTML }) => {
          this.$emit('input', getHTML())
        }
      }
    }
  },
  mounted() {
    this.editor = new Editor(this.editorConfig)
  },
  beforeDestroy() {
    // this.editor.clearContent(true)
    if (this.editor) {
      this.editor.destroy()
    }
  },
  watch: {
    placeholder(newValue) {
      this.editor.extensions.options.placeholder.emptyNodeText = newValue
    },
    pageId() {
      if (this.editor) {
        this.editor.destroy()
        this.editor = new Editor(this.editorConfig)
        this.editor.setContent(this.value, false)
      }
    },
    archived: {
      handler: function () {
        if (this.editor) {
          this.editor.setOptions({ editable: !this.archived })
        }
      },
      immediate: true
    }
  },
  methods: {
    showImagePrompt(command) {
      const src = prompt('Enter the url of your image here')
      if (src !== null) {
        command({ src })
      }
    },
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.linkInput.focus()
      })
    },
    hideLinkMenu() {
      this.linkUrl = null
      this.linkMenuIsActive = false
    },
    setLinkUrl(command, url) {
      command({ href: url })
      this.hideLinkMenu()
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/scss/editor.scss';
@import '@/assets/scss/menubar.scss';
@import '@/assets/scss/menububble.scss';

</style>
