// import webpack from 'webpack';
import Config from 'webpack-chain';
import cleanWebPackPlugin from 'clean-webpack-plugin';
import MiniCss from 'mini-css-extract-plugin';
import UglifyjsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCss from 'optimize-css-assets-webpack-plugin';
import baseConfig from './base';
import uglifyjsOpt from './uglifyjsOpt';
import { Jugg } from '..';

export default (jugg: Jugg): Config => {
  const { JConfig } = jugg;
  const config = baseConfig(jugg);
  const filename = '[name].[chunkhash]';

  config.output.filename(`${filename}.js`);

  if (JConfig.sourceMap) {
    config.devtool('source-map');
  }

  config
    .plugin('clean-webpack-plugin')
    .use(cleanWebPackPlugin, [
      [JConfig.outputDir],
      {
        root: process.cwd(),
      },
    ])
    .end()
    .plugin('mini-css-extract-plugin')
    .use(MiniCss, [
      {
        filename: `${filename}.css`,
        chunkFilename: `${filename}.css`,
      },
    ])
    .end()
    .plugin('html-webpack-plugin-base')
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
    .minimizer('optimize-css-assets-webpack-plugin')
    .use(OptimizeCss, [{}])
    .end()
    .minimizer('uglifyjs-webpack-plugin')
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
