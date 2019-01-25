# jugg-plugin-react

A set of babel config to support React.
Config of babel depending on `jugg-plugin-babel`.
There is also some config for RHL(react-hot-loader).

# ts-rhl-transformer

It's located at `@axew/jugg-plugin-react/lib/ts-rhl-transformer`. It is a TypeScript compiler transformer handling the most same as `react-hot-loader/babel` and working with ts-loader.

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

- there are two ways to support hot reload friendly in TypeScript.
  - use ts transformer, for example in `.juggrc.js`. This plugin can be used independently, that means you can remove babel config only using ts-loader to handle ts, tsx, js and jsx:
  ```js
    module.exports = {
      tsCustomTransformers: {
        // add this
        before: ['@axew/jugg-plugin-react/lib/ts-rhl-transformer']
      }
    };
  ```
  - change ts compiler to babel, set `compileTs: true` in `jugg-plugin-babel` config, which will use `react-hot-loader/babel`, [detail](https://www.npmjs.com/package/react-hot-loader/v/4.6.3#typescript).