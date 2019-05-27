import MiniCss from 'mini-css-extract-plugin';
import webpack from 'webpack';
import Config from 'webpack-chain';
import { Jugg } from '..';
import baseConfig from './base';
import { Plugin } from './chainCfgMap';

export default (jugg: Jugg): Config => {
  const config = baseConfig(jugg);

  config.devtool('cheap-module-source-map');

  config.output
    .filename('[name].js')
    .chunkFilename('[name].js')
    .end();

  // set in run/dev
  // config
  //   .entry('index')
  //   .prepend(require.resolve('webpack-dev-server/client') + '?http://localhost:3000/sockjs-node')
  //   .prepend(require.resolve('webpack/hot/dev-server'));

  config
    .plugin(Plugin.HOT_MODULE_REPLACEMENT)
    .use(webpack.HotModuleReplacementPlugin)
    .end()
    .plugin(Plugin.MINI_CSS_EXTRACT)
    .use(MiniCss)
    .end();

  return config;
};
