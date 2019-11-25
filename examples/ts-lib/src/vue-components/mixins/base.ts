import { Component, Vue } from 'vue-property-decorator';

@Component
export default class CommonMixin extends Vue {
  clsPrefix = 'ts-lib-prefix';
}
