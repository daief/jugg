// import webpack from 'webpack';
import Config from 'webpack-chain';
import { getAbsolutePath } from '../utils';

export default (): Config => {
  const config = new Config();
  config
    .entry('index')
    .add(getAbsolutePath('src', 'index.js'))
    .end()
    .output.path(getAbsolutePath('dist'))
    .filename('[name].[chunkhash:8].js')
    .chunkFilename('[name].[chunkhash:8].vendor.js')
    .publicPath('/')
    .end();

  return config;
};
