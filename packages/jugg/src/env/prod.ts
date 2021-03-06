// import webpack from 'webpack';
import cleanWebPackPlugin from 'clean-webpack-plugin';
import MiniCss from 'mini-css-extract-plugin';
import OptimizeCss from 'optimize-css-assets-webpack-plugin';
import UglifyjsPlugin from 'uglifyjs-webpack-plugin';
import Config from 'webpack-chain';
import { Jugg } from '..';
import baseConfig from './base';
import { Minimizer, Plugin } from './chainCfgMap';
import uglifyjsOpt from './uglifyjsOpt';

export default (jugg: Jugg): Config => {
  const { JConfig } = jugg;
  const { outputDir, filename, html, chunks, sourceMap } = JConfig;
  const config = baseConfig(jugg);

  config.output.filename(`${filename}.js`);

  if (sourceMap) {
    config.devtool('source-map');
  }

  config
    .plugin(Plugin.CLEAN_WEBPACK_PLUGIN)
    .use(cleanWebPackPlugin, [
      [outputDir],
      {
        root: jugg.context,
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
    .end();

  if (html !== false) {
    // remove at base.ts
    config
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
  }

  config.optimization
    .minimizer(Minimizer.OPTIMIZE_CSS_ASSETS)
    // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/141#issuecomment-393140346
    .use(OptimizeCss, [
      {
        cssProcessorOptions: {
          // set to false if you want CSS source maps
          ...(sourceMap === true
            ? {
                map: { inline: false },
              }
            : {}),
        },
      },
    ])
    .end()
    .minimizer(Minimizer.UGLIFYJS_WEBPACK)
    .use(UglifyjsPlugin, [uglifyjsOpt(JConfig)])
    .end();

  if (chunks === true) {
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
