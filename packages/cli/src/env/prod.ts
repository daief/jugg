// import webpack from 'webpack';
import Config from 'webpack-chain';
import cleanWebPackPlugin from 'clean-webpack-plugin';
import baseConfig from './base';
import { getAbsolutePath } from '../utils';

export default (): Config => {
  const config = baseConfig();

  config.output.path(getAbsolutePath('dist')).filename('[name].[chunkhash].js');

  config.plugin('clean-webpack-plugin').use(cleanWebPackPlugin, [
    [getAbsolutePath('dist')],
    {
      root: process.cwd(),
    },
  ]);

  return config;
};
