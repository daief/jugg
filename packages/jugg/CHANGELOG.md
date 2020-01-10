## 0.2.1-alpha.2 - 2020-01-10

- feat: 插件可以扩展用户配置
- refactor: `quiet` of `webpack-dev-server` always true
- refactor: 配置文件统一管理，如 `tsconfig.json`

## 0.2.1-alpha.1 - 2020-01-02

- refactor: 方法整理，并导出内置方法

## 0.2.1-alpha.0 - 2020-01-02

- refactor: 集中式管理 webpack 插件、loader 等等的配置项，并对外提供获取、修改的途径
- feat: 新增 `jugg inspect` 命令用于查看配置
- feat: 命令行支持 `mode=` 以配置 `NODE_ENV`，默认 `development`
  - 但当运行 `dev`、`build` 时，`NODE_ENV` 总是为 `development` 和 `production`
- feat: 除了自动载入 `.env` 环境变量文件，还会根据 `mode` 载入 `.mode.env` 文件
- refactor: webpack 回调中注入 `jugg`

## 0.2.0 - 2019-11-11

- feat: support set `tsconfig.json` by `JUGG_TS_PROJECT` env
