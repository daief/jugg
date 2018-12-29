# jugg-plugin-react

Support React.

# config

```ts
interface Options {
  jReactPresetOption?: JReactPresetOption;
}

interface JReactPresetOption {
  // use `babel-plugin-transform-react-remove-prop-types` ? default false
  removePropTypes?: boolean;
  // use `babel-plugin-react-require` ? default false
  reactRequire?: boolean;
}

```

# react hot loader

[you should add code like this](https://www.npmjs.com/package/react-hot-loader/v/4.6.3#getting-started):

```js
// App.js
import { hot } from 'react-hot-loader/root'
const App = () => <div>Hello World!</div>
export default hot(App)
```

## notice

- Want to support hot reload friendly in TypeScript, you'd better change ts compiler to babel, set `compileTs: true` in `jugg-plugin-babel` config, [detail](https://www.npmjs.com/package/react-hot-loader/v/4.6.3#typescript).
