import { extendConfig } from '@axew/jugg';

export default extendConfig({
  plugins: [['@axew/jugg-plugin-doc']],
  // transpileDependencies: [/\/jugg-plugin-doc\//i],
  transpileDependencies: p => {
    return /jugg-plugin-doc/i.test(p);
  },
  define: {
    THEME_CONFIG: {
      title: 'title',
    },
  },
});
