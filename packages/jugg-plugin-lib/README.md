# jugg-plugin-lib

[![](https://img.shields.io/npm/v/@axew/jugg-plugin-lib.svg?style=flat)](https://github.com/daief/jugg/tree/master/packages/jugg-plugin-lib)

Help to build npm library.
Most of here reference [antd-tools](http://github.com/ant-design/antd-tools).

# usage

`.juggrc.js`:

```js
module.exports = {
  plugins: ['@axew/jugg-plugin-lib'],
};
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
  /**
   * copy file to dest with this suffix, built-in `png|jpg|jpeg|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf|otf`
   * @example `md|html`
   */
  copyFileSuffix?: string;
  /**
   * set source code dir, default contains `src`
   */
  sourceDir?: string | string[];
}
```

## notice

- **All in TS** is recommended. But also can work with JS source. But there will be no declaration files for js source.
- Use `.browserslistrc` config or `browserslist` key in package.json to share target browsers with Babel, ESLint and Stylelint. See [Browserslist docs](https://github.com/browserslist/browserslist#queries) for available queries and default value.
  ```json
  {
    // previous built-in config
    "browsers": [
      "last 2 versions",
      "Firefox ESR",
      "> 1%",
      "ie >= 9",
      "iOS >= 8",
      "Android >= 4"
    ]
  }
  ```
