// import webpack from 'webpack';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { getAbsolutePath } from '../utils';
import setLoaders from './loaders';

export default (): Config => {
  const config = new Config();
  (config as any).mode(process.env.NODE_ENV);

  config
    .entry('index')
    .add(getAbsolutePath('src', 'index.js'))
    .end()
    .output.path(getAbsolutePath('dist'))
    .filename('[name].[hash].js')
    .chunkFilename('[name].[chunkhash].js')
    .publicPath('/')
    .end();

  config
    .plugin('html-webpack-plugin-base')
    .use(HtmlWebpackPlugin, [
      {
        filename: getAbsolutePath('dist', 'index.html'),
        template: getAbsolutePath('src', 'document.ejs'),
        inject: true,
      },
    ])
    .end();

  // set loaders
  setLoaders(config);

  return config;
};
