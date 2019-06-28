# Jugg

What is Jugg？

A front-end scaffold 🛠️ work with Webpack.

# basic command

```bash
# start a webpack-dev-server
$ jugg dev

# build with webpack
$ jugg build
```

## jugg dev

```bash
$ jugg dev -h
Usage: dev [options]

start dev server

Options:
  -p, --port [port]              dev server port
  --noDevClients [noDevClients]  when set, do not add dev clients to webpack entry  (default: false)
  -h, --help                     output usage information

```

> [Since webpack-dev-server v3.2.0](https://github.com/webpack/webpack-dev-server/releases/tag/v3.2.0), automatically add the HMR plugin when hot or hotOnly is enabled. Can set `noDevClients` to disable built-in config to entry.

## jugg build

```bash
$ jugg build -h
Usage: build [options]

exec build

Options:
  -h, --help  output usage information
```

# directory

Simple directory can be something like this, default entry can be `src/index.{tsx?|jsx?}`. `tsconfig.json` is necessary only when you use TypeScript.

```bash
.
├── src
│   └── index.ts
└── tsconfig.json

```

# config

Create a file named `.juggrc.js`, `.juggrc.ts`, `jugg.config.js`, etc. Or write config object in `package.json`.

```ts
interface JuggConfig {
  /**
   * publicPath of webpack, default '/'
   */
  publicPath?: string;
  /**
   * output path of webpack, default 'dist'
   */
  outputDir?: string;
  plugins?: PluginCfgSchema[];
  define?: { [k: string]: any };
  /**
   * open chunks config? default true
   */
  chunks?: boolean;
  /**
   * sourceMap, default true
   */
  sourceMap?: boolean;
  webpack?: JuggWebpack;
  /**
   * ts-loader custom transformers, only work when ts-loader is enabled
   */
  tsCustomTransformers?: {
    before?: PluginCfgSchema[];
    after?: PluginCfgSchema[];
  };
  /**
   * set bundle file name in production env, default `[name].[chunkhash]`.
   * affect js, css.
   */
  filename?: string;
  /**
   * built-in base webpack html plugin config.
   * set false to rm plugin.
   */
  html?: false | KeyValuePair;
  /**
   * config of css, less, postcss...
   */
  css?: {
    loaderOptions?: {
      /**
       * https://github.com/webpack-contrib/css-loader#options
       */
      css?: any;
      /**
       * http://lesscss.org/usage/#command-line-usage-options
       */
      less?: any;
      /**
       * https://github.com/postcss/postcss-loader/tree/v3.0.0#options
       * when `false`, disable the `postcss`
       */
      postcss?:
        | {
            config?: {
              context?: any;
              path?: any;
            };
            /**
             * when `false`, disable built-in plugins
             */
            plugins?: any;
            [k: string]: any;
          }
        | false;
    };
  };
  /**
   * add dependencies to compile by ts-loader or babel
   * if item is string, it will be convert a regex such as `join('node_modules', item, '/')`
   * @since 0.1.1
   */
  transpileDependencies?: Array<string | RegExp> | ((pth: string) => boolean);
}

type JuggWebpack = webpack.Configuration | (
  param: {
    config: webpackChain.Config;
    webpack: webpack.Configuration;
  }
) => void | webpack.Configuration;

type PluginCfgSchema = string | [string, { [k: string]: any }?];
```

# env

- ANALYZE
  - enable webpack-bundle-analyzer
- ANALYZE_PORT
  - webpack-bundle-analyzer server port, default 8888
- ANALYZE_DUMP
  - generate stats file while ANALYZE_DUMP exist
- FORK_TS_CHECKER
  - set `none`, disbale fork-ts-checker-webpack-plugin
- HARD_SOURCE
  - set `none`, disbale hard-source-webpack-plugin
- NO_WEBPACKBAR
  - when opened, remove webpackbar plugin

# `TS` or `JS`

Both `TS` and `JS` can be used together in a project with `jugg`. There are several situations with handleing TS and JS:

- **Default & Recommended**: create a `tsconfig.json`, then jugg will open ts-loader and use it to compile ts, tsx, js, tsx. `babel` is needless here.
  - ts-loader: ts, tsx, js, jsx
  - babel: needless
- Set config in `.juggrc.js` with `jugg-plugin-babel`. Babel plugin will rewrite built-in config of ts-loader for js and jsx and handle then with itself.
  - ts-loader: ts, tsx
  - babel: js, jsx
- Set `compileTs: true` in `jugg-plugin-babel` config will clean all built-in ts-loader options. Babel handles all the file.
  - ts-loader: cleaned
  - babel: ts, tsx, js, jsx

# Notice

- `import()` works with `"module": "esnext"` in `tsconfig.json`, [detail](https://github.com/webpack/webpack/issues/5703#issuecomment-357512412).
- - Use `.browserslistrc` config or `browserslist` key in package.json to share target browsers with Babel, ESLint and Stylelint. See [Browserslist docs](https://github.com/browserslist/browserslist#queries) for available queries and default value.
  ```json
  {
    // previous built-in config
    "browserslist": [
      "last 2 versions",
      "Firefox ESR",
      "> 1%",
      "ie >= 9",
      "iOS >= 8",
      "Android >= 4"
    ]
  }
  ```
