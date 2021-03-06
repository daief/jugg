// import webpack from 'webpack';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import Config from 'webpack-chain';
import Webpackbar from 'webpackbar';
import { Jugg } from '..';
import { searchPlaces } from '../utils';
import { Entry, Plugin } from './chainCfgMap';
import setLoaders from './loaders';
import { FilterCSSConflictingWarning } from './plugins';

export default (jugg: Jugg): Config => {
  const config = new Config();
  const { JConfig, Utils, WebpackOptionsManager } = jugg;
  const { outputDir, html } = JConfig;
  const { getAbsolutePath } = Utils;

  (config as any).mode(process.env.NODE_ENV);

  config.context(jugg.context);

  config
    .entry(Entry.INDEX)
    .add(WebpackOptionsManager.findOpts(Entry.INDEX))
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
    .plugin(Plugin.FILTER_CSS_CONFLICT_WARNING_PLUGIN)
    .use(FilterCSSConflictingWarning)
    .end()
    .plugin(Plugin.FRIENDLY_ERRORS_PLUGIN)
    .use(FriendlyErrorsWebpackPlugin)
    .end()
    .plugin(Plugin.DEFINE_PLUGIN)
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
    .plugin(Plugin.CASE_SENSITIVE_PATHS_PLUGIN)
    .use(CaseSensitivePathsPlugin)
    .end();

  // -------------------------------------- set loaders
  setLoaders(config, jugg);

  // -------------------------------------- Modify the Config
  // webpack html plugin config
  if (html !== false) {
    const userTpl = getAbsolutePath('src', 'document.ejs');
    const htmlOpt: any = {
      filename: 'index.html',
      inject: true,
    };

    if (fs.existsSync(userTpl)) {
      htmlOpt.template = 'src/document.ejs';
    }

    config
      .plugin(Plugin.BASE_HTML_PLUGIN)
      .use(HtmlWebpackPlugin, [
        {
          ...htmlOpt,
          ...html,
        },
      ])
      .end();
  }

  // -------------------------------------- webpack-bundle-analyzer
  if (process.env.ANALYZE) {
    config
      .plugin(Plugin.BUNDLE_ANALYZER)
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

  // -------------------------------------- hard-source-webpack-plugin
  if (process.env.HARD_SOURCE !== 'none') {
    config
      .plugin(Plugin.HARD_SOURCE_PLUGIN)
      .use(require('hard-source-webpack-plugin'), [
        {
          environmentHash: {
            root: jugg.context,
            directories: ['config'],
            files: ['package-lock.json', 'yarn.lock', ...searchPlaces('jugg')],
          },
        },
      ]);
  }

  // -------------------------------------- Webpackbar
  if (!process.env.NO_WEBPACKBAR) {
    config
      .plugin(Plugin.WEBPACKBAR_PLUGIN)
      .use(Webpackbar)
      .end();
  }

  return config;
};
