import webpack from 'webpack';
import Config from 'webpack-chain';
import baseConfig from './base';

export default (): Config => {
  const base = baseConfig();
  const config = new Config();
  config.merge(base.toConfig());
  // config.plugin('mini-css').use(require('mini-css-extract-plugin'));
  config.plugin('hot-module').use(webpack.HotModuleReplacementPlugin);
  // config.devtool('cheap-module-source-map');
  return config;
};
