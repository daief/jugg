<!-- more -->

# jugg-plugin-doc

插件。

用于方便快速地构建一个文档网站，有以下特点：

- 主题风格来源于 [Ant Design](https://ant.design/index-cn)。
- 基于 React、antd 编写
- 可在 Markdown 中运行代码块，支持
  - 普通的代码块
  - 渲染 React 组件
  - 渲染 Vue 组件

> 功能还在完善中...

## 使用

在配置文件中添加插件。

```ts
// .juggrc.js
import { extendConfig } from '@axew/jugg';

export default extendConfig({
  plugins: [
    [
      '@axew/jugg-plugin-doc',
      {
        source: {
          docs: ['README.md'],
        },
      },
    ],
    // 如果有涉及 Vue demo 的渲染，请添加对应的 vue 插件
    '@axew/jugg-plugin-vue',
  ],
});
```

启动服务

```bash
$ jugg doc --dev
```

打包文档网站

```bash
$ jugg doc --build
```

## 配置

配置项类型定义。

```ts
interface IOptions {
  source?: Record<string, string[]>;
  title?: string;
  description?: string;
}
```

### source

默认基于当前工作路径去寻找文件，支持 `glob` 匹配模式。该项中，`docs` 目前作为一个略微特殊的字段，在该字段中配置的文件届时会在一级菜单中展开。

```json
{
  "source": {
    "docs": ["README.md", "docs/**/*.md"],
    "item1": ["item1/**/*.md"]
  }
}
```

## Notice

### 基于 TS 进行编译

当工作路径下不存在 TS 配置文件或者**存在一份名为 `tsconfig.json` 时**，此时都会选择加载一份内置的文件 `jugg-plugin-doc/site/tsconfig.doc.json`。
