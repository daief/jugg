import { extendConfig } from '@axew/jugg';

export default extendConfig({
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  tsCustomTransformers: {
    before: ['@axew/jugg-plugin-react/lib/ts-rhl-transformer'],
  },
});
