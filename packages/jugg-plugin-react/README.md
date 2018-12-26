# jugg-plugin-multi-html

A jugg plugin helps to dev with react.

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

# example

```js
// .juggrc.js
export default {
  plugins: [
    '@axew/jugg-plugin-babel',
    [
      '@axew/jugg-plugin-react',
      {
        jReactPresetOption: {
          removePropTypes: true,
          reactRequire: true
        }
      }
    ]
  ]
}
```
