import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import Database from './services/Database'

import '@/assets/css/tailwind.css'

Vue.config.productionTip = false

const app = new Vue({
  router,
  store,
  render: h => h(App)
})

Database.get().then(db => {
  Vue.prototype.$db = db
  app.$mount('#app')
})
