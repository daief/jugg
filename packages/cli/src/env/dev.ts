import webpack from 'webpack';
import Config from 'webpack-chain';
import baseConfig from './base';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';

export default (): Config => {
  const config = baseConfig();

  config.devtool('cheap-module-source-map');

  config
    .plugin('hot-module-replacement-plugin')
    .use(webpack.HotModuleReplacementPlugin)
    .end()
    .plugin('friendly-errors-webpack-plugin')
    .use(FriendlyErrorsWebpackPlugin)
    .end();

  return config;
};
