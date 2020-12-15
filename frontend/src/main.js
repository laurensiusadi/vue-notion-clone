import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import axios from 'axios'
import Database from './services/Database'
import { VTooltip, VPopover, VClosePopover } from 'v-tooltip'

import '@/assets/scss/tailwind.scss'
import '@/assets/scss/main.scss'
import '@/assets/scss/tooltip.scss'

Vue.config.productionTip = false
Vue.directive('tooltip', VTooltip)
Vue.directive('close-popover', VClosePopover)
Vue.component('v-popover', VPopover)

Vue.prototype.$http = axios
const token = localStorage.getItem('token')
if (token) {
  Vue.prototype.$http.defaults.headers.common.Authorization = token
}

const app = new Vue({
  router,
  store,
  render: h => h(App)
})

Database.get().then(db => {
  Vue.prototype.$db = db
  app.$mount('#app')
})
