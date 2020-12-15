import Vue from 'vue'
import VueRouter from 'vue-router'
import MainApp from '../views/MainApp.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/app'
  },
  {
    path: '/app',
    name: 'MainApp',
    component: MainApp
  },
  {
    path: '/app/:pageId',
    name: 'Page',
    component: MainApp
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
