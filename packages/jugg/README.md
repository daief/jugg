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

# Notice

- `import()` works with `"module": "esnext"` in `tsconfig.json`, [detail](https://github.com/webpack/webpack/issues/5703#issuecomment-357512412).