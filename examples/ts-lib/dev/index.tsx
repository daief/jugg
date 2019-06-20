/**
 * import module
 */
import LIB, { ReactButton, sayAnswer } from '../src';
/**
 * import style
 */
import '../src/style';

import * as React from 'react';
import { render } from 'react-dom';

import Vue from 'vue';
import VueApp from './VueApp.vue';

LIB.use(Vue);

/**
 * use function from lib
 */
sayAnswer();

/**
 * use React Component from lib
 */
const ReactApp = () => {
  return (
    <ReactButton onClick={() => alert('This is a `Button` in React')}>
      This is a `Button` in React
    </ReactButton>
  );
};

render(<ReactApp />, document.getElementById('root-react'));

/**
 * use Vue Component from lib
 */
new Vue({
  render: h => h(VueApp),
}).$mount('#root-vue');
