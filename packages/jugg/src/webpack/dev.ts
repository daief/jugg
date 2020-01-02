import webpack from 'webpack';
import Config from 'webpack-chain';
import { Jugg } from '..';
import { Plugin } from '../env/chainCfgMap';
import baseConfig from './config';

export default (jugg: Jugg): Config => {
  const config = baseConfig(jugg);
  const { WebpackOptionsManager } = jugg;

  config.devtool('cheap-module-source-map');

  config
    .plugin(Plugin.HOT_MODULE_REPLACEMENT)
    .use(
      webpack.HotModuleReplacementPlugin,
      WebpackOptionsManager.findOpts(Plugin.HOT_MODULE_REPLACEMENT),
    );

  return config;
};
