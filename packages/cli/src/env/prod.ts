// import webpack from 'webpack';
import Config from 'webpack-chain';
import cleanWebPackPlugin from 'clean-webpack-plugin';
import MiniCss from 'mini-css-extract-plugin';
import baseConfig from './base';
import { getAbsolutePath } from '../utils';

export default (): Config => {
  const config = baseConfig();
  const filename = '[name].[chunkhash]';

  config.output.path(getAbsolutePath('dist')).filename(`${filename}.js`);

  config.plugin('clean-webpack-plugin').use(cleanWebPackPlugin, [
    [getAbsolutePath('dist')],
    {
      root: process.cwd(),
    },
  ]);

  config
    .plugin('mini-css-extract-plugin')
    .use(MiniCss, [
      {
        filename: `${filename}.css`,
        chunkFilename: `${filename}.css`,
      },
    ])
    .end();

  return config;
};
