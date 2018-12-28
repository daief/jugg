# jugg-plugin-babel

A set of babel config.

# config

```ts
interface Option {
  cache?: boolean;
  babelrc?: boolean;
  presets?: PluginCfgSchema[];
  plugins?: PluginCfgSchema[];
  // some options about @babel/preset-env & @babel/plugin-transform-runtime
  juggPreset?: IJuggPreset;
}

interface IJuggPreset {
  // https://babeljs.io/docs/en/babel-preset-env
  useBuiltIns?: string | boolean;
  loose?: boolean;
  targets?: {
    browsers: string[];
    [k: string]: any;
  };
  modules?: string | boolean;
  // rest options of `@babel/preset-env`
  env?: {
    [k: string]: any;
  };
  // https://babeljs.io/docs/en/babel-plugin-transform-runtime
  transformRuntime?: {
    [k: string]: any;
  };
}

```