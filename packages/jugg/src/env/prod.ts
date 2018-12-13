// import webpack from 'webpack';
import Config from 'webpack-chain';
import cleanWebPackPlugin from 'clean-webpack-plugin';
import MiniCss from 'mini-css-extract-plugin';
import UglifyjsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCss from 'optimize-css-assets-webpack-plugin';
import baseConfig from './base';
import { getAbsolutePath } from '../utils';
import uglifyjsOpt from './uglifyjsOpt';
import { Jugg } from '..';

export default (jugg: Jugg): Config => {
  const config = baseConfig(jugg);
  const filename = '[name].[chunkhash]';

  config.output.path(getAbsolutePath('dist')).filename(`${filename}.js`);

  config
    .plugin('clean-webpack-plugin')
    .use(cleanWebPackPlugin, [
      [getAbsolutePath('dist')],
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
    .end();

  config.optimization
    .minimizer('optimize-css-assets-webpack-plugin')
    .use(OptimizeCss)
    .end()
    .minimizer('uglifyjs-webpack-plugin')
    .use(UglifyjsPlugin, [uglifyjsOpt])
    .end();

  return config;
};
