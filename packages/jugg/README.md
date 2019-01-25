# Jugg

What is Jugg？

![](https://d1u5p3l4wpay3k.cloudfront.net/dota2_gamepedia/0/03/Juggernaut_icon.png?version=99b0ef7bad0a95b1a29110f536607f9e)

A front-end scaffold 🛠️  work with Webpack.

# basic command

```bash
# start a webpack-dev-server
$ jugg dev

# build with webpack
$ jugg build
```

# directory

Simple directory can be something like this, default entry can be `src/index.{tsx?|jsx?}`. `tsconfig.json` is necessary only when you use TypeScript.

```bash
.
├── src
│   └── index.ts
└── tsconfig.json

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