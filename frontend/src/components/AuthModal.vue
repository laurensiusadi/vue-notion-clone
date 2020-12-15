<template>
  <modal v-if="isAuthModalOpen" @close="closeModal" :containerWidth="400" :minHeight="0">
    <template v-if="!isAuth">
      <div slot="tab" class="flex justify-center mt-4">
        <button
          class="inline-block px-4 py-1 rounded-full"
          :class="[currentTab === 'login' ? 'bg-gray-600 text-white' : 'bg-gray-100' ]"
          @click="currentTab='login'"
        >
          Sign In
        </button>
        <button
          class="inline-block px-4 py-1 ml-1 rounded-full"
          :class="[currentTab === 'register' ? 'bg-gray-600 text-white' : 'bg-gray-100' ]"
          @click="currentTab='register'"
        >
          Register
        </button>
      </div>
      <div slot="body" v-if="currentTab === 'login'">
        <form class="flex flex-col" @submit.prevent="login">
          <div class="mb-4">
            <label class="block mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase" for="username">
              Username
            </label>
            <input v-model="user.username" class="w-full px-3 py-2 border rounded appearance-none" id="username" type="text" placeholder="Username">
          </div>
          <div class="mb-6">
            <label class="block mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase" for="password">
              Password
            </label>
            <input v-model="user.password" class="w-full px-3 py-2 mb-3 border rounded appearance-none" id="password" type="password" placeholder="********">
          </div>
          <div class="flex items-center justify-between">
            <button class="px-5 py-2 font-bold text-white bg-green-500 rounded-full" type="submit" :disabled="isAuthPending">
              {{ isAuthPending ? 'Loading...' : 'Sign In' }}
            </button>
            <a class="inline-block text-sm font-bold text-green-500 align-baseline" href="#">
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
      <div slot="body" v-else>
        <form class="flex flex-col" @submit.prevent="register">
          <div class="mb-4">
            <label class="block mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase" for="username">
              Username
            </label>
            <input v-model="user.username" class="w-full px-3 py-2 border rounded appearance-none" id="username" type="text" placeholder="Username">
          </div>
          <div class="mb-6">
            <label class="block mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase" for="password">
              Password
            </label>
            <input v-model="user.password" class="w-full px-3 py-2 mb-3 border rounded appearance-none" id="password" type="password" placeholder="********">
          </div>
          <div class="mb-6">
            <label class="block mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase" for="confirm-password">
              Confirm Password
            </label>
            <input v-model="user.confirmPassword" class="w-full px-3 py-2 mb-3 border rounded appearance-none" id="confirm-password" type="password" placeholder="********">
          </div>
          <div class="flex items-center justify-between">
            <button class="px-5 py-2 font-bold text-white bg-green-500 rounded-full" type="submit" :disabled="isAuthPending">
              {{ isAuthPending ? 'Loading...' : 'Register' }}
            </button>
          </div>
          <div v-if="authError">
            {{ authError }}
          </div>
        </form>
      </div>
    </template>
    <template v-else>
      <h1 slot="header">Hi, {{ username }}</h1>
      <div slot="footer">
        <button @click="logout" class="px-5 py-2 font-bold text-white bg-green-500 rounded-full">Logout</button>
      </div>
    </template>
  </modal>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Modal from '@/components/Modal'

export default {
  name: 'AuthModal',
  components: {
    Modal
  },
  data() {
    return {
      currentTab: 'login',
      user: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    ...mapState(['isAuthPending', 'authError', 'isAuthModalOpen']),
    ...mapGetters(['isAuth']),
    username() {
      return this.$store.state.user.username
    }
  },
  methods: {
    resetUser() {
      this.user = {
        username: '',
        password: '',
        confirmPassword: ''
      }
    },
    closeModal() {
      this.$store.commit('toggleAuthModal', false)
    },
    login() {
      this.$store.dispatch('login', this.user)
        .then(() => {
          this.resetUser()
          this.closeModal()
        })
        .catch(err => console.log(err))
    },
    register() {
      this.$store.dispatch('register', this.user)
        .then(() => {
          this.resetUser()
          this.closeModal()
        })
        .catch(err => {
          console.log(err)
        })
    },
    logout() {
      this.$store.dispatch('logout').then(() => { this.closeModal() })
    }
  }
}
</script>
