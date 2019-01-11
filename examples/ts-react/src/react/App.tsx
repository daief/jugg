import * as React from 'react';

import { hot } from 'react-hot-loader/root';

import {Child} from './Child';

export default hot(() => (
  <div>
    <h1>app</h1>

    <hr/>

    <Child />
  </div>
));
