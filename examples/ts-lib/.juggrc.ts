import { extendConfig } from '@axew/jugg';

const isProd = process.env.NODE_ENV === 'production';

export default extendConfig({
  plugins: ['@axew/jugg-plugin-vue', '@axew/jugg-plugin-lib'],
  tsCustomTransformers: {
    before: ['@axew/jugg-plugin-react/lib/ts-rhl-transformer'],
  },
  webpack({ config }) {
    if (!isProd) {
      config
        .entry('dev')
        .add('./dev/index')
        .end();
    } else {
      config.output
        .library('TestLibrary')
        .libraryTarget('umd')
        .end()
        .externals({
          vue: 'vue',
          react: 'react',
        })
        .end();
    }

    config
      .entry('index')
      .add('./src/style')
      .end();
  },
  html: isProd
    ? false
    : {
        template: 'dev/document.ejs',
      },
  filename: 'index',
  chunks: false,
});
