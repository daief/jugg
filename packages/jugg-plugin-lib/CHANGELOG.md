# CHANGELOG

## 0.2.0 -

- feat: 支持在插件内部配置 `tsCustomTransformers`，且当插件配置的 `tsCustomTransformers` 不存在时会去读取 `.juggrc` 中的 `tsCustomTransformers`
- feat: 支持通过设置环境变量 `JUGG_TS_PROJECT` 以指定特定的 tsconfig.json
