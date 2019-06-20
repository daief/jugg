import { extendConfig } from '@axew/jugg';

export default extendConfig({
  plugins: ['@axew/jugg-plugin-vue', '@axew/jugg-plugin-lib'],
  tsCustomTransformers: {
    before: ['@axew/jugg-plugin-react/lib/ts-rhl-transformer'],
  },
  webpack({ config }) {
    config
      .entry('dev')
      .add('./dev/index')
      .end()
      .entry('style')
      .add('./src/style')
      .end();
  },
  html:
    process.env.NODE_ENV === 'production'
      ? false
      : {
          template: 'dev/document.ejs',
        },
});
