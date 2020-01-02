import cleanWebPackPlugin from 'clean-webpack-plugin';
import OptimizeCss from 'optimize-css-assets-webpack-plugin';
import UglifyjsPlugin from 'uglifyjs-webpack-plugin';
import Config from 'webpack-chain';
import { Jugg } from '..';
import { Minimizer, Plugin, Rule } from '../env/chainCfgMap';
import baseConfig from './config';

export default (jugg: Jugg): Config => {
  const config = baseConfig(jugg);
  const {
    // IsProd,
    WebpackOptionsManager,
    JConfig,
  } = jugg;
  const { chunks, sourceMap } = JConfig;

  if (sourceMap) {
    config.devtool('source-map');
  }

  // loader image-webpack-loader
  config.module
    .rule(Rule.IMAGES_IMAGE_WEBPACK_LOADER_RULE)
    .test(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/)
    .use('image-webpack-loader')
    .loader(require.resolve('image-webpack-loader'))
    .options(
      WebpackOptionsManager.findOpts(Rule.IMAGES_IMAGE_WEBPACK_LOADER_RULE),
    );

  // plugin clean-webpack-plugin
  config
    .plugin(Plugin.CLEAN_WEBPACK_PLUGIN)
    .use(
      cleanWebPackPlugin,
      WebpackOptionsManager.findOpts(Plugin.CLEAN_WEBPACK_PLUGIN),
    );

  // minimizer optimize-css-assets-webpack-plugin
  config.optimization
    .minimizer(Minimizer.OPTIMIZE_CSS_ASSETS)
    // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/141#issuecomment-393140346
    .use(
      OptimizeCss,
      WebpackOptionsManager.findOpts(Minimizer.OPTIMIZE_CSS_ASSETS),
    );

  // minimizer uglifyjs-webpack-plugin
  config.optimization
    .minimizer(Minimizer.UGLIFYJS_WEBPACK)
    .use(
      UglifyjsPlugin,
      WebpackOptionsManager.findOpts(Minimizer.UGLIFYJS_WEBPACK),
    );

  if (chunks === true) {
    config.optimization
      .splitChunks(WebpackOptionsManager.findOpts(Minimizer.SPLIT_CHUNKS))
      .runtimeChunk(false);
  }

  return config;
};
