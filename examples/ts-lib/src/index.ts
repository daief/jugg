export * from './function';

export { default as ReactButton } from './react-components/Button';

import VueButton from './vue-components/Button';
import VueToast from './vue-components/Toast';

export { VueButton };

export default {
  install(vue: any) {
    [VueButton, VueToast].forEach(_ => {
      // @ts-ignore
      _.install(vue);
    });
  },
};
