// import webpack from 'webpack';
import Config from 'webpack-chain';
import cleanWebPackPlugin from 'clean-webpack-plugin';
import MiniCss from 'mini-css-extract-plugin';
import UglifyjsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCss from 'optimize-css-assets-webpack-plugin';
import baseConfig from './base';
import uglifyjsOpt from './uglifyjsOpt';
import { Jugg } from '..';
import { Plugin, Minimizer } from './chainCfgMap';

export default (jugg: Jugg): Config => {
  const { JConfig } = jugg;
  const config = baseConfig(jugg);
  const filename = '[name].[chunkhash]';

  config.output.filename(`${filename}.js`);

  if (JConfig.sourceMap) {
    config.devtool('source-map');
  }

  config
    .plugin(Plugin.CLEAN_WEBPACK_PLUGIN)
    .use(cleanWebPackPlugin, [
      [JConfig.outputDir],
      {
        root: process.cwd(),
      },
    ])
    .end()
    .plugin(Plugin.MINI_CSS_EXTRACT)
    .use(MiniCss, [
      {
        filename: `${filename}.css`,
        chunkFilename: `${filename}.css`,
      },
    ])
    .end()
    .plugin(Plugin.BASE_HTML_PLUGIN)
    .tap(c => [
      {
        minify: {
          caseSensitive: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: false,
          removeComments: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: true,
          minifyURLs: true,
        },
        ...c[0],
      },
    ])
    .end();

  config.optimization
    .minimizer(Minimizer.OPTIMIZE_CSS_ASSETS)
    .use(OptimizeCss, [{}])
    .end()
    .minimizer(Minimizer.UGLIFYJS_WEBPACK)
    .use(UglifyjsPlugin, [uglifyjsOpt(JConfig)])
    .end();

  if (JConfig.chunks === true) {
    config.optimization
      .splitChunks({
        cacheGroups: {
          vendors: {
            name: 'vendors',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
          },
          commons: {
            name: 'commons',
            chunks: 'async',
            minChunks: 2,
          },
        },
      })
      .runtimeChunk(false)
      .end();
  }

  return config;
};
