import webpack from 'webpack';
import Config from 'webpack-chain';
import baseConfig from './base';
import MiniCss from 'mini-css-extract-plugin';

export default (): Config => {
  const config = baseConfig();

  config.devtool('cheap-module-source-map');

  config
    .plugin('hot-module-replacement-plugin')
    .use(webpack.HotModuleReplacementPlugin)
    .end()
    .plugin('mini-css-extract-plugin')
    .use(MiniCss)
    .end();

  return config;
};
