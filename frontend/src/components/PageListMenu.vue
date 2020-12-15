<template>
  <div class="block-menu" style="width: 240px;">
    <div class="section">
      <div class="item" role="button" tabindex="0" v-close-popover @click="deletePage">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">delete</i>
          </div>
        </div>
        <div class="text"><div>Delete</div></div>
        <div class="suffix"><span>Del</span></div>
      </div>
      <div class="item" role="button" tabindex="0" v-close-popover @click="duplicatePage">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">content_copy</i>
          </div>
        </div>
        <div class="text"><div>Duplicate</div></div>
        <div class="suffix"><span>Ctrl+D</span></div>
      </div>
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">link</i>
          </div>
        </div>
        <div class="text"><div>Copy link</div></div>
        <div class="suffix"><span></span></div>
      </div>
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">edit</i>
          </div>
        </div>
        <div class="text"><div>Rename</div></div>
        <div class="suffix"><span>Ctrl+Shift+R</span></div>
      </div>
    </div>
    <div class="section">
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">east</i>
          </div>
        </div>
        <div class="text"><div>Move to</div></div>
        <div class="suffix"><span>Ctrl+Shift+P</span></div>
      </div>
    </div>
    <div class="border-none section">
      <div class="flex items-center w-full text-sm leading-5 cursor-pointer select-none" role="button" tabindex="0">
        <div class="pb-1 pl-4 suffix">
          <span class="text-xs text-gray-400">Last edited by User1<br/>Yesterday at 10:16pm</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectID from 'bson-objectid'

export default {
  name: 'PageListMenu',
  props: ['page', 'db'],
  methods: {
    deletePage() {
      this.page.remove().then(() => {
        this.$router.push({ path: '/app' })
      })
    },
    duplicatePage() {
      const pageId = ObjectID().toString()
      this.db.pages.insert({
        ...this.page,
        id: pageId,
        userId: this.$store.getters.isAuth ? this.$store.getters.getUser.id : 'user1'
      }).then(() => {
        this.$router.push({ path: `/app/${pageId}` })
      })
    }
  }
}
</script>
