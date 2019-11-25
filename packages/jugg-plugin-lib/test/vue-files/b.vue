<template>
  <div><Custom /></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// @ts-ignore
import Custom from 'xx-lib/Custom.vue';
@Component({
  components: {
    Custom,
  },
})
export default class extends Vue {}
</script>

<style scoped lang="less"></style>
