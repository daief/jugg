## tsx

```tsx
export default <div>tsx demo</div>;
```

## no default export

```tsx
const x = <div>tsx demo</div>;
```

## vue

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
