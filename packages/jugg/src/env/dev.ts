import webpack from 'webpack';
import Config from 'webpack-chain';
import baseConfig from './base';
import MiniCss from 'mini-css-extract-plugin';
import { Jugg } from '..';

export default (jugg: Jugg): Config => {
  const config = baseConfig(jugg);

  config.devtool('cheap-module-source-map');

  // set in run/dev
  // config
  //   .entry('index')
  //   .prepend(require.resolve('webpack-dev-server/client') + '?http://localhost:3000/sockjs-node')
  //   .prepend(require.resolve('webpack/hot/dev-server'));

  config
    .plugin('hot-module-replacement-plugin')
    .use(webpack.HotModuleReplacementPlugin)
    .end()
    .plugin('mini-css-extract-plugin')
    .use(MiniCss)
    .end();

  return config;
};
