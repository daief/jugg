# jugg-plugin-react

Support React depending on `jugg-plugin-babel`.

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
// App.js  root component
import { hot } from 'react-hot-loader/root'
const App = () => <div>Hello World!</div>
export default hot(App)
```

## notice

- there are two way to support hot reload friendly in TypeScript.
  - change ts compiler to babel, set `compileTs: true` in `jugg-plugin-babel` config, which will use `react-hot-loader/babel`, [detail](https://www.npmjs.com/package/react-hot-loader/v/4.6.3#typescript).
  - use ts transformer, for example, in `.juggrc.js`:

  ```js
    const config = {
      tsCustomTransformers: {
        // add this
        before: ['@axew/jugg-plugin-react/lib/ts-rhl-transformer']
      }
    };

    module.exports = config;
  ```
