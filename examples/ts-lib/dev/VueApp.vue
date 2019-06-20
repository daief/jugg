<template>
  <VueButton @click="handleClick">This is a `Button` in Vue</VueButton>
</template>

<script lang="js">
export default {
  methods: {
    handleClick() {
      alert('This is a `Button` in Vue')
    }
  },
}
</script>

