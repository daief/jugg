// import webpack from 'webpack';
import Config from 'webpack-chain';
import cleanWebPackPlugin from 'clean-webpack-plugin';
import baseConfig from './base';
import { getAbsolutePath } from '../utils';

export default (): Config => {
  const base = baseConfig();
  const config = new Config();
  config.merge(base.toConfig());

  config.plugin('clean').use(cleanWebPackPlugin, [
    [getAbsolutePath('dist')],
    {
      root: process.cwd(),
    },
  ]);
  // config.plugin('mini-css').use(require('mini-css-extract-plugin'));
  // config.plugin('hot-module').use(webpack.HotModuleReplacementPlugin);
  // config.devtool('cheap-module-source-map');
  return config;
};
