<template>
  <div id="app">
    <ul>
      <li><router-link to="/">home</router-link></li>
      <li><router-link to="/about">about</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class App extends Vue {

}
</script>

<style lang="less">
#app {
  // 'Avenir'
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: whitesmoke;
  color: #2c3e50;
  overflow: hidden;
  font-size: 12px;
}
</style>
