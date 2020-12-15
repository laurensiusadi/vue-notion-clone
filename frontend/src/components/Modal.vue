<template>
  <transition name="modal">
    <div class="modal-mask" @mousedown="$emit('close')">
      <div class="modal-wrapper">
        <div
          class="modal-container"
          :style="`max-width: ${containerWidth}px; min-height: ${minHeight}px`"
          @mousedown.stop
        >
          <div class="modal-tab">
            <slot name="tab"></slot>
          </div>
          <div class="modal-header">
            <slot name="header"></slot>
          </div>
          <div class="modal-body">
            <slot name="body"></slot>
          </div>
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'modal',
  props: {
    minHeight: {
      type: Number,
      default: 440
    },
    containerWidth: {
      type: Number,
      default: 600
    }
  },
  created() {
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.$emit('close')
      }
    }
    document.addEventListener('keydown', escapeHandler)

    this.$once('hook:destroyed', () => {
      document.removeEventListener('keydown', escapeHandler)
    })
  }
}
</script>

<style lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.modal-container {
  max-height: 90vh;
  width: 100%;
  margin: 10px 20px 20px;
  padding: 28px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all .3s ease;
  font-family: inherit;
  display: flex;
  flex-direction: column;
}

.modal-tab {
  margin-top: -24px;
  margin-bottom: 16px;
}

.modal-header {
  margin-top: 0;
  font-weight: 600;
  font-size: 24px;
  color: #333;
}

.modal-body {
  margin: 0 0 30px;
}

.modal-footer {
  margin-top: auto;
  overflow: auto;
  > div {
    display: flex;
  }
}

.modal-save-button {
  margin-left: 12px;
}

.modal-close-button {
  margin-left: auto;
}

.modal-delete-button {
  padding: 2px 8px;
  height: 30px;
}

.modal-enter, .modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container, .modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
