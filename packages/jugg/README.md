# Jugg

A front-end scaffold 🛠️ works with Webpack.

# basic commands

```bash
# start a webpack-dev-server / 启动 dev 服务
$ jugg dev

# build with webpack / 启动打包命令
$ jugg build

# inspect webpack config / 检查 webpack 配置
$ jugg inspect

# help / 查看帮助
$ jugg -h
```

## options

### -C, --config

指定特定的配置文件，默认会读取 `.juggrc.ts`、`.juggrc.js` 等。

```bash
# 加载 .myconfig.ts 配置文件
$ jugg dev --config=.myconfig.ts
```

### -M, --mode

指定 `process.env.NODE_ENV`

```bash
# 查看 production 环境的 webpack 配置
$ jugg inspect --mode=production
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

> ~~[Since webpack-dev-server v3.2.0](https://github.com/webpack/webpack-dev-server/releases/tag/v3.2.0), automatically add the HMR plugin when hot or hotOnly is enabled. Can set `noDevClients` to disable built-in config to entry.~~
>
> 现在可以不用顾及 `noDevClients` 的设置了，未来也会进行移除。

## jugg build

```bash
$ jugg build -h
Usage: build [options]

exec build

Options:
  -h, --help  output usage information
```

## jugg inspect

```bash
$ jugg inspect -h
Usage: inspect [options]

inspect webpack config

Options:
  -P, --path [path]  a path file to write result
  -h, --help         output usage information
```

# getting started

只要创建满足如下结构的目录，就可以开始使用了，入口文件会是 `src/index`，可以是 JS 或 TS。只有当使用 TypeScript 时才需要创建 `tsconfig.json`。

```bash
.
├── src
│   └── index.ts
└── tsconfig.json

```

# config file

Create a file named `.juggrc.js`, `.juggrc.ts`, `jugg.config.js`, etc. Export default a object.

创建名为 `.juggrc.js`、`.juggrc.ts` 或 `jugg.config.js` 的文件，默认导出一个对象，配置对象的类型描述如下。

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
  /**
   * 配置插件
   */
  plugins?: PluginCfgSchema[];
  /**
   * webpack DefinePluin
   */
  define?: { [k: string]: any };
  /**
   * open chunks config? default true
   */
  chunks?: boolean;
  /**
   * sourceMap, default true
   */
  sourceMap?: boolean;
  /**
   * webpack 配置扩展
   */
  webpack?: JuggWebpack;
  /**
   * ts-loader custom transformers, only works when ts-loader is enabled
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
    jugg: Jugg;
  }
) => void | webpack.Configuration;

type PluginCfgSchema = string | [string, { [k: string]: any }?];
```

一份可行的配置可参考：[jugg/examples/ts-lib](https://github.com/daief/jugg/blob/master/examples/ts-lib/.juggrc.ts)。

# env

支持的环境变量。

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
- JUGG_TS_PROJECT
  - set a value to assign a specific tsconfig.json / 指定自定义的 TS 配置文件

# `TS` or `JS`

Both `TS` and `JS` can be used together in a project with `jugg`. There are several situations with handleing TS and JS:

- **Default & Recommended**: create a `tsconfig.json`, then jugg will load ts-loader and use it to compile `ts`, `tsx`, `js`, `tsx`. `babel` is needless here.
  - ts-loader: ts, tsx, js, jsx
  - babel: needless
- Set config in `.juggrc.js` with `jugg-plugin-babel`. Babel plugin will rewrite built-in config of ts-loader for `js` and `jsx` and handle them with itself.
  - ts-loader: ts, tsx
  - babel: js, jsx
- Set `compileTs: true` in `jugg-plugin-babel` config will clean all built-in ts-loader options. Babel handles all the files.
  - ts-loader: cleaned
  - babel: ts, tsx, js, jsx

# Notice

- `import()` works with `"module": "esnext"` in `tsconfig.json`, [detail](https://github.com/webpack/webpack/issues/5703#issuecomment-357512412).
- Use `.browserslistrc` config or `browserslist` key in package.json to share target browsers with Babel, ESLint and Stylelint. See [Browserslist docs](https://github.com/browserslist/browserslist#queries) for available queries and default value.
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
- `jugg` 默认不进行 `polyfill`
