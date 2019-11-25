<template>
  <div>
    <SubVue />
    <p>{{ state1 }} - {{ state2 }}</p>
  </div>
</template>

<script lang="ts">
import base from '../mixins/base';
import SubVue from './SubVue.vue';

export default {
  name: 'toast',
  data() {
    return {
      state1: 'state1',
      state2: 'state2',
    };
  },
  mixins: [base],
  components: {
    SubVue,
  },
};
</script>
