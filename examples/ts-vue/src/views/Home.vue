<template>
  <div class="home">
    <h1>this is home page</h1>
    <p @click="changeTitle">
      title from store: {{homeStore.title}}
      <br>
      click to change
    </p>

    <hr>

    <child />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { IHomeState } from '../stores/homeStore';
import Child from '@/components/Child.vue';

@Component({
  components: {
    Child
  }
})
export default class Home extends Vue {
  // states of store
  @State public homeStore!: IHomeState;

  changeTitle() {
    this.$store.dispatch('homeStore/setTitle', `home title - ${(Math.random() * 100).toFixed(0)}`)
  }
}
</script>

<style lang="less" scoped>

</style>
