import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const localStorageKey = 'token'

export default new Vuex.Store({
  state: {
    isAuthModalOpen: false,
    isAuthPending: false,
    isAuthSuccess: false,
    authError: null,
    authToken: localStorage.getItem(localStorageKey) || '',
    user: {}
  },
  getters: {
    isAuth: state => !!state.authToken
  },
  mutations: {
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
          console.log('response', data)
          const authToken = data.token
          const user = {
            'X-Hasura-User-Id': data.id,
            id: data.id,
            username: data.username,
            roles: data.roles
          }
          localStorage.setItem(localStorageKey, authToken)
          commit('authSuccess', { authToken, user })
        }).catch(err => {
          commit('authError', err)
          localStorage.removeItem(localStorageKey)
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
          console.log('response', data)
          const authToken = data.token
          const user = {
            'X-Hasura-User-Id': data.id,
            id: data.id,
            username: data.username,
            roles: data.roles
          }
          localStorage.setItem(localStorageKey, authToken)
          commit('authSuccess', { authToken, user })
          resolve(data)
        }).catch(err => {
          commit('authError', err)
          localStorage.removeItem(localStorageKey)
          reject(err)
        })
      })
    },
    logout({ commit }) {
      return new Promise((resolve, reject) => {
        commit('logout')
        localStorage.removeItem(localStorageKey)
        resolve()
      })
    }
  },
  modules: {
  }
})
