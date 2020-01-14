---
title: ✍️ Markdown 书写规则
layout: article
---

<!-- more -->

一份可行的 markdown 文件模板可参考如下，每一份 markdown 文件会被渲染成一个菜单页面。

````md
---
title: 文档指南
order: -2
cols: 1
---

## demo 标题

demo 的一些描述。

```tsx
import * as React from 'react';

export default <div>demo 1 运行效果</div>;
```

## demo2 标题

demo2 的一些描述。

```tsx
import * as React from 'react';

const x = (
  <div>demo 2 没有默认导出，只展示代码片段，但此处代码块依旧会被执行。</div>
);
```

<!-- more -->

## API

其他内容。
````

这样的 Markdown 可分成三部分来介绍。

### 元数据（配置项）

文件顶部如下形式的内容即配置项部分。

```md
---
title: 文档指南
order: -2
cols: 1
---
```

字段说明：

| 属性     | 说明                                                                                                  | 类型                | 默认值  |
| -------- | ----------------------------------------------------------------------------------------------------- | ------------------- | ------- |
| title    | 会被用于生成 title                                                                                    | string              | 文件名  |
| cols     | demo 排布规则                                                                                         | 1 \| 2              | 2       |
| order    | 排序值，值越小，位置越前                                                                              | -                   | 999     |
| layout   | 布局，配置文件中 `docs` 下的使用 `article`，其他使用 `demo`。`README`、`CHANGELOG` 自动使用 `article` | `article` \| `demo` | -       |
| timeline | 时间轴布局，仅在 `article` 布局中生效，文件名为 `CHANGELOG` 时自动开启                                | boolean             | `false` |

> layout 的区别：
>
> - `article`：不会展示代码块
> - `demo`：会展示代码块
>
> 当不显示地设置 layout 时，layout 的逻辑：
>
> - 当页面处于一级菜单页，即路径为 `/docs/xxx` 时，认为是 `article`
> - Markdown 名称为 README 时，认为是 `article`
> - 其他情况认为是 `demo`

### 被 `<!-- more -->` 分隔的 `代码解析区域`

`<!-- more -->` 会将 Markdown 分成两块，第一块作为代码解析块。

注意点：

- 不符合解析规则的部分会被直接忽略跳过，满足以下的会被解析成 demo：
  - 每一个 demo 块由 `##` 标题开始
  - `##` 紧跟一个 `代码块`，而且这个代码块需要是 `js`、`jsx`、`ts`、`tsx`，这两部分才会被解析到一个 demo
    - 如果有 `默认导出`，则导出的内容会被作为 React 组件进行渲染
    - 没有默认导出，只展示代码块，不会有渲染效果，**但代码块依旧会被执行**
  - 在上述基础上，如果再紧跟一个 `html` 的代码块，那么这些内容会被整合成一个 Vue 的 demo 进行渲染
- 代码块默认导出的内容会被作为组件渲染，否则没有运行效果，只会展示代码片段

````md
## demo 标题

demo 的一些描述。

```tsx
import * as React from 'react';

export default <div>demo 1 运行效果</div>;
```

## demo2 标题

demo2 的一些描述。

```tsx
import * as React from 'react';

const x = <div>demo 2 没有默认导出，只展示代码片段</div>;
```

## 渲染一个 Vue 组件

```ts
// 脚本部分
export default {
  name: 'vueDemo',
  data() {
    return {
      count: 1,
    };
  },
};
```

```html
<!-- 模板部分 -->
<template>
  <div>
    count: {{count}}
    <br />
    <button @click="count++">click to add</button>
  </div>
</template>
<style lang="less" scoped>
  button {
    padding: 10px;
    color: green;
    outline: 0;
  }
</style>
```
````

### `<!-- more -->` 分隔后剩余的部分

这部分只会原样被解析到 HTML 再渲染出来，用于编写额外内容。

## 🐛 目前已知的问题

- [ ] 代码块中不能引用路径以 `.` 开头的资源，如 `import './a'`、`import '../x'`。
