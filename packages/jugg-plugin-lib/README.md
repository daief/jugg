# jugg-plugin-lib

[![](https://img.shields.io/npm/v/@axew/jugg-plugin-lib.svg?style=flat)](https://github.com/daief/jugg/tree/master/packages/jugg-plugin-lib)

Help to build npm library.
Most of here reference [antd-tools](http://github.com/ant-design/antd-tools).

# usage

`.juggrc.js`:

```js
module.exports = {
  plugins: [
    '@axew/jugg-plugin-lib'
  ]
}
```

then you can use `lib` commond:

```bash
$ jugg lib
```

get `lib/` & `es/` results form `src/`.

# config

```ts
interface IOptions {
  /**
   * convert less import in es/lib to css file path, default `true`
   */
  convertLessImport2Css?: boolean;
}

```

## notice

- **All in TS** is recommended. But also can work with JS source. But there will be no declaration files for js source.