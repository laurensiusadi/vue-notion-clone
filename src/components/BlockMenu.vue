<template>
  <div class="block-menu" style="width: 240px;">
    <div class="pt-3 pb-2">
      <div class="flex items-center w-full leading-5 select-none">
        <div class="flex-auto min-w-0 mx-4">
          <div class="flex items-center w-full h-8 px-2 py-1 text-sm leading-5 border border-gray-300 rounded shadow-inner bg-gray-50 cursor-text focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-300">
            <input class="block w-full p-0 bg-transparent border-none resize-none" placeholder="Filter actions…" type="text">
          </div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">delete</i>
          </div>
        </div>
        <div class="text"><div>Delete</div></div>
        <div class="suffix"><span>Del</span></div>
      </div>
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">content_copy</i>
          </div>
        </div>
        <div class="text"><div>Duplicate</div></div>
        <div class="suffix"><span>Ctrl+D</span></div>
      </div>
      <v-popover
        placement="left"
        offset="-12"
        trigger="manual"
        :open="isTurnIntoOpen"
        @apply-hide="isTurnIntoOpen=false"
      >
        <div class="item" role="button" tabindex="0"
          @click="isTurnIntoOpen=true" @mouseenter="isTurnIntoOpen=true"
        >
          <div class="prefix">
            <div class="flex items-center justify-center">
              <i class="material-icons">repeat</i>
            </div>
          </div>
          <div class="text"><div>Turn into</div></div>
          <div class="suffix">
            <span>
              <i class="material-icons">chevron_right</i>
            </span>
          </div>
        </div>
        <template slot="popover">
          <div class="py-2 block-menu" style="width: 200px">
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'text-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <i class="material-icons">notes</i>
                </div>
              </div>
              <div class="text"><div>Text</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'heading-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <span class="w-4 p-px mx-px text-xs font-bold text-gray-500">H1</span>
                </div>
              </div>
              <div class="text"><div>Headline 1</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'sub-heading-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <span class="w-4 p-px mx-px text-xs font-bold text-gray-500">H2</span>
                </div>
              </div>
              <div class="text"><div>Headline 2</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'sub-sub-heading-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <span class="w-4 p-px mx-px text-xs font-bold text-gray-500">H3</span>
                </div>
              </div>
              <div class="text"><div>Headline 3</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover>
              <!--@click="$emit('update-block', 'blockType', 'page-block')" -->
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <i class="material-icons">description</i>
                </div>
              </div>
              <div class="text"><div>Page</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'to-do-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <i class="material-icons">check_box</i>
                </div>
              </div>
              <div class="text"><div>To-do list</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'bulleted-list-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <i class="material-icons">format_list_bulleted</i>
                </div>
              </div>
              <div class="text"><div>Bulleted list</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'numbered-list-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <i class="material-icons">format_list_numbered</i>
                </div>
              </div>
              <div class="text"><div>Numbered list</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'code-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <i class="material-icons">code</i>
                </div>
              </div>
              <div class="text"><div>Code</div></div>
            </div>
            <div class="item" role="button" tabindex="0" v-close-popover @click="$emit('update-block', 'blockType', 'quote-block')">
              <div class="prefix">
                <div class="flex items-center justify-center">
                  <i class="material-icons">format_quote</i>
                </div>
              </div>
              <div class="text"><div>Quote</div></div>
            </div>
          </div>
        </template>
      </v-popover>
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">add_box</i>
          </div>
        </div>
        <div class="text"><div>Turn into page</div></div>
        <div class="suffix">
          <i class="material-icons">chevron_right</i>
        </div>
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
    <div class="section">
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">comment</i>
          </div>
        </div>
        <div class="text"><div>Comment</div></div>
        <div class="suffix"><span>Ctrl+Shift+M</span></div>
      </div>
    </div>
    <div class="section">
      <div class="item" role="button" tabindex="0">
        <div class="prefix">
          <div class="flex items-center justify-center">
            <i class="material-icons">format_paint</i>
          </div>
        </div>
        <div class="text"><div>Color</div></div>
        <div class="suffix">
          <span>
            <i class="-mr-1 material-icons">chevron_right</i>
          </span>
        </div>
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
export default {
  name: 'BlockMenu',
  data() {
    return {
      isTurnIntoOpen: false
    }
  }
}
</script>
