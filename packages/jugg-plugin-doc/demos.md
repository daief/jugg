## tsx

默认导出并渲染了一个 React 组件。

```tsx
import { Button } from 'antd';

export default (
  <Button onClick={() => alert('You, clicked me!')}>tsx demo</Button>
);
```

## no default export

没有默认导出，但执行了代码，可在控制台查看日志。

```tsx
const x = <div>tsx demo</div>;
console.log('来自 demo 的日志', x);
```

## vue

默认导出并渲染了一个 Vue 组件，确切地说是一颗 Vue 树。

```ts
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

<!-- more -->

## 上述效果对应的 Markdown

````
## tsx

默认导出并渲染了一个 React 组件。

```tsx
import { Button } from 'antd';

export default (
  <Button onClick={() => alert('You, clicked me!')}>tsx demo</Button>
);
```

## no default export

没有默认导出，但执行了代码，可在控制台查看日志。

```tsx
const x = <div>tsx demo</div>;
console.log('来自 demo 的日志', x);
```

## vue

默认导出并渲染了一个 Vue 组件，确切地说是一颗 Vue 树。

```ts
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
