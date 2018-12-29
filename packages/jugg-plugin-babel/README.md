# jugg-plugin-babel

A set of babel config.

# config

```ts
interface Option {
  // use cache? default true
  cache?: boolean;
  // allow .babelrc? default false
  babelrc?: boolean;
  // more presets
  presets?: PluginCfgSchema[];
  // more plugins
  plugins?: PluginCfgSchema[];
  // use babel to compile ts、tsx, enabling this will clear built-in ts-loader, default false,
  compileTs?: boolean;
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