<template>
  <div>
    <h1>this is child component </h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Child extends Vue {

}
</script>
