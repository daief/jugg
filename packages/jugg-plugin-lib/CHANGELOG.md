# CHANGELOG

- [ ] fix: 使用 `tsConvertImportFrom` 替换 import 模块的路径后，相应生成的类型文件不更新
  - 如（见 ts-lib/src/vue-components/Button/index）：`import Button from './button.vue'` => `import Button from './button.js'`，类型文件中依旧是引用的 `.vue`
- [ ] fix: 当 `vue` 文件中使用 `vue-property-decorator` 时，编译结果会有依赖丢失的现象

## 0.2.2

- refactor: `.vue` 编译后的后缀改为 `ts`

## 0.2.1 - 2019-11-13

- fix: `.vue` 文件中可能是 TS 代码，暂且将文件命名为 `tsx` 后缀

## 0.2.0 - 2019-11-11

- feat: 支持在插件内部配置 `tsCustomTransformers`，且当插件配置的 `tsCustomTransformers` 不存在时会去读取 `.juggrc` 中的 `tsCustomTransformers`
- feat: 支持通过设置环境变量 `JUGG_TS_PROJECT` 以指定特定的 tsconfig.json
