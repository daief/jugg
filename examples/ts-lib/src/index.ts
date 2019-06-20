export * from './function';

export { default as ReactButton } from './react-components/Button';

import VueButton from './vue-components/Button';

export { VueButton };

export default {
  use(vue: any) {
    // @ts-ignore
    VueButton.install(vue);
  },
};
