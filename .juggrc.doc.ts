import { extendConfig } from '@axew/jugg';

export default extendConfig({
  plugins: [['@axew/jugg-plugin-doc']],
  transpileDependencies: [/\/jugg-plugin-doc\//i],
});
