<template>
  <div id="app">
    <router-view/>
    <auth-modal/>
  </div>
</template>

<script>
import AuthModal from '@/components/AuthModal'

export default {
  name: 'App',
  components: {
    AuthModal
  }
}
</script>
