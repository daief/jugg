import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { IJuggPreset } from './preset';

export interface Option {
  cache?: boolean;
  babelrc?: boolean;
  presets?: Array<string | [string, any]>;
  plugins?: Array<string | [string, any]>;
  juggPreset?: IJuggPreset;
}

export default (api: PluginAPI, opts: Option) => {
  const dCfg: Option = {
    cache: true,
    babelrc: false,
    presets: [],
    plugins: [],
    juggPreset: {},
  };

  const { cache, babelrc, presets, plugins, juggPreset } = { ...dCfg, ...opts };

  api.chainWebpack(({ config }) => {
    const jsRule = config.module
      .rule('jugg-plugin-babel-rule')
      .test(/\.jsx?$/)
      .exclude.add(filepath => /node_modules/.test(filepath))
      .end();

    jsRule
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options({
        // default true
        cacheDirectory: cache,
        // default false
        babelrc,
        presets: [[require.resolve('./preset'), juggPreset], ...presets],
        plugins: [...plugins],
      });
  });
};
