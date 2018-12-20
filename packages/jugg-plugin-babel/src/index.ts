import { PluginAPI } from '@axew/jugg/types/PluginAPI';

export interface Option {
  cache?: boolean;
  babelrc?: boolean;
}

export default (api: PluginAPI, opts: Option) => {
  const dCfg: Option = {
    cache: true,
    babelrc: false,
  };

  const { cache, babelrc } = { ...dCfg, ...opts };

  api.chainWebpack(({ config }) => {
    if (api.jugg.IsProd) {
      const jsRule = config.module
        .rule('babel-js')
        .test(/\.jsx?$/)
        .exclude.add(filepath => {
          return /node_modules/.test(filepath);
        })
        .end();

      jsRule
        .use('babel-loader')
        .loader('babel-loader')
        .options({
          // default true
          cacheDirectory: cache,
          // default false
          babelrc,
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime'],
        });
    }
  });
};
