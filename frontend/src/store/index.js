import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as Database from '../services/Database'

Vue.use(Vuex)

const localStorageToken = 'token'
const localStorageUser = 'user'

export default new Vuex.Store({
  state: {
    isLoading: true,
    isAuthModalOpen: false,
    isAuthPending: false,
    isAuthSuccess: false,
    authError: null,
    authToken: localStorage.getItem(localStorageToken) || '',
    user: localStorage.getItem(localStorageUser) || {},
    pages: []
  },
  getters: {
    isAuth: state => !!state.authToken,
    pages: state => state.pages.sort((a, b) => a.order - b.order),
    getUser: state => {
      if (typeof state.user === 'string') {
        return JSON.parse(state.user)
      }
      return state.user
    }
  },
  mutations: {
    setLoading(state, bool) {
      state.isLoading = bool
    },
    toggleAuthModal(state, bool) {
      state.isAuthModalOpen = bool
    },
    setAuthPending(state) {
      state.isAuthPending = true
      state.isAuthSuccess = false
      state.authError = null
    },
    authSuccess(state, { authToken, user }) {
      state.isAuthPending = false
      state.isAuthSuccess = true
      state.authToken = authToken
      state.user = user
    },
    authError(state, err) {
      state.isAuthPending = false
      state.isAuthSuccess = false
      state.authError = err
    },
    logout(state) {
      state.isAuthPending = false
      state.authError = null
      state.authToken = ''
    },
    setPages(state, pages) {
      state.pages = pages
    }
  },
  actions: {
    register({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit('setAuthPending')
        axios({
          url: 'http://localhost:3030/signup',
          data: user,
          method: 'POST'
        }).then(response => {
          const data = response.data
          const authToken = data.token
          const user = {
            'X-Hasura-User-Id': data.id,
            id: data.id,
            username: data.username,
            roles: data.roles
          }
          localStorage.setItem(localStorageToken, authToken)
          localStorage.setItem(localStorageUser, JSON.stringify(user))
          commit('authSuccess', { authToken, user })
        }).catch(err => {
          commit('authError', err)
          localStorage.removeItem(localStorageToken)
          localStorage.removeItem(localStorageUser)
          reject(err)
        })
      })
    },
    login({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit('setAuthPending')
        axios({
          url: 'http://localhost:3030/login',
          data: {
            username: user.username,
            password: user.password
          },
          method: 'POST'
        }).then(response => {
          const data = response.data
          const authToken = data.token
          const user = {
            'X-Hasura-User-Id': data.id,
            id: data.id,
            username: data.username,
            roles: data.roles
          }
          localStorage.setItem(localStorageToken, authToken)
          localStorage.setItem(localStorageUser, JSON.stringify(user))
          commit('authSuccess', { authToken, user })
          resolve(data)
        }).catch(err => {
          commit('authError', err)
          localStorage.removeItem(localStorageToken)
          localStorage.removeItem(localStorageUser)
          reject(err)
        })
      })
    },
    async logout ({ commit }) {
      await Database.removeDb()
      commit('setPages', [])
      commit('logout')
      localStorage.removeItem(localStorageToken)
      localStorage.removeItem(localStorageUser)
    }
  },
  modules: {
  }
})