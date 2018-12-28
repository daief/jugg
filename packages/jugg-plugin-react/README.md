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