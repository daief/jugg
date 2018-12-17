// import webpack from 'webpack';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Webpackbar from 'webpackbar';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { getAbsolutePath } from '../utils';
import setLoaders from './loaders';
import { FilterCSSConflictingWarning } from '../plugins';
import { Jugg } from '..';
import fs from 'fs';
import { logger } from '../utils/logger';

export default (_: Jugg): Config => {
  const config = new Config();
  (config as any).mode(process.env.NODE_ENV);

  config
    .entry('index')
    .add(getAbsolutePath('src', 'index.ts'))
    .end()
    .output.path(getAbsolutePath('dist'))
    .filename('[name].[hash].js')
    .chunkFilename('[name].[chunkhash].js')
    .publicPath('/')
    .end()
    .resolve.extensions.merge(['.js', '.jsx', '.ts', '.tsx', '.vue']);

  config
    .plugin('html-webpack-plugin-base')
    .use(HtmlWebpackPlugin, [
      {
        filename: getAbsolutePath('dist', 'index.html'),
        inject: true,
      },
    ])
    .end()
    .plugin('webpackbar')
    .use(Webpackbar)
    .end()
    .plugin('filter-css-conflict-warning')
    .use(FilterCSSConflictingWarning)
    .end()
    .plugin('friendly-errors-webpack-plugin')
    .use(FriendlyErrorsWebpackPlugin)
    .end();

  // -------------------------------------- set loaders
  setLoaders(config);

  // -------------------------------------- Modify the Config
  const userTpl = getAbsolutePath('src', 'document.ejs');
  if (fs.existsSync(userTpl)) {
    config.plugin('html-webpack-plugin-base').tap(c => [
      {
        template: userTpl,
        ...c[0],
      },
    ]);
  } else {
    logger.warn('Cannot find document.ejs, use default template');
  }

  return config;
};
