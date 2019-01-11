// import webpack from 'webpack';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Webpackbar from 'webpackbar';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { getAbsolutePath } from '../utils';
import setLoaders from './loaders';
import { FilterCSSConflictingWarning } from './plugins';
import { Jugg } from '..';
import fs from 'fs';
import { logger } from '../utils/logger';
import webpack from 'webpack';

export default (jugg: Jugg): Config => {
  const config = new Config();
  const { JConfig } = jugg;
  const { outputDir } = JConfig;

  (config as any).mode(process.env.NODE_ENV);

  config.context(jugg.context);

  config
    .entry('index')
    .add('./src/index')
    .end()
    .output.path(getAbsolutePath(outputDir))
    .filename('[name].[hash].js')
    .chunkFilename('[name].[chunkhash].js')
    .publicPath(JConfig.publicPath)
    .end()
    .resolve.extensions.merge(['.js', '.jsx', '.ts', '.tsx', '.vue'])
    .end()
    .alias.set('@', getAbsolutePath('src'))
    .end();

  config
    .plugin('html-webpack-plugin-base')
    .use(HtmlWebpackPlugin, [
      {
        filename: 'index.html',
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
    .end()
    .plugin('define')
    .use(webpack.DefinePlugin, [
      {
        ...(() => {
          // convert object
          const { define } = JConfig;
          const result: any = {};
          Object.keys(define).forEach(key => {
            result[key] = JSON.stringify(define[key]);
          });
          return result;
        })(),
      },
    ])
    .end()
    .plugin('case-sensitive-paths')
    .use(CaseSensitivePathsPlugin)
    .end();

  // -------------------------------------- set loaders
  setLoaders(config, jugg);

  // -------------------------------------- Modify the Config
  const userTpl = getAbsolutePath('src', 'document.ejs');
  if (fs.existsSync(userTpl)) {
    config.plugin('html-webpack-plugin-base').tap(c => [
      {
        template: 'src/document.ejs',
        ...c[0],
      },
    ]);
  } else {
    logger.warn('Cannot find document.ejs, use default template');
  }

  // -------------------------------------- webpack-bundle-analyzer
  if (process.env.ANALYZE) {
    config
      .plugin('webpack-bundle-analyzer')
      .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [
        {
          analyzerMode: 'server',
          analyzerPort: process.env.ANALYZE_PORT || 8888,
          openAnalyzer: true,
          // generate stats file while ANALYZE_DUMP exist
          generateStatsFile: !!process.env.ANALYZE_DUMP,
          statsFilename: process.env.ANALYZE_DUMP || 'stats.json',
        },
      ]);
  }

  return config;
};
