<template>
  <button class="ts-lib-vue-button" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script lang="js">
import Vue from 'vue'

export default {
  name: 'VueButton',
  props: {

  },
  methods: {
    handleClick(e) {
      this.$emit('click', e)
    }
  }
}
</script>

