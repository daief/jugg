import { extendConfig } from '@axew/jugg';
import * as fs from 'fs';
import * as path from 'path';

const packagesMds = fs
  .readdirSync(path.resolve(__dirname, 'packages'))
  .reduce<any>((result, pkg) => {
    result[pkg] = [`packages/${pkg}/*.md`];
    return result;
  }, {});

export default extendConfig({
  publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
  plugins: [
    '@axew/jugg-plugin-vue',
    [
      '@axew/jugg-plugin-doc',
      {
        source: {
          docs: ['README.md'],
          ...packagesMds,
        },
        title: 'Jugg',
        description: 'A naive front-end scaffold.',
      },
    ],
  ],
  sourceMap: false,
});
