import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { IJuggPreset } from './preset';
import { PluginCfgSchema } from '@axew/jugg/types';

export interface Option {
  cache?: boolean;
  babelrc?: boolean;
  presets?: PluginCfgSchema[];
  plugins?: PluginCfgSchema[];
  // use babel to compile tsx?, default false, enabling this will clear built-in ts-loader
  compileTs?: boolean;
  // some options about @babel/preset-env & @babel/plugin-transform-runtime
  juggPreset?: IJuggPreset;
}

export default (api: PluginAPI, opts: Option) => {
  const dCfg: Option = {
    cache: true,
    babelrc: false,
    presets: [],
    plugins: [],
    compileTs: false,
    juggPreset: {},
  };

  const { cache, babelrc, presets, plugins, compileTs, juggPreset } = { ...dCfg, ...opts };

  const babelOpts = {
    // default true
    cacheDirectory: cache,
    // default false
    babelrc,
    presets: [[require.resolve('./preset'), juggPreset], ...presets],
    plugins: [...plugins],
  };

  api.chainWebpack(({ config }) => {
    // ------------------------- jsx? file babel config
    config.module
      .rule('jugg-plugin-babel-rule')
      .test(/\.jsx?$/)
      .exclude.add(filepath => /node_modules/.test(filepath))
      .end()
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options(babelOpts);

    // use babel to compile typescript
    // ------------------------- tsx? file babel config
    if (compileTs === true) {
      // rm ts-loader
      config.module.rule('ts-rule').uses.clear();

      config.module.rule('tsx-rule').uses.clear();

      config.module
        .rule('jugg-plugin-babel-ts-rule')
        .test(/\.tsx?$/)
        .exclude.add(filepath => /node_modules/.test(filepath))
        .end()
        .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options({
          ...babelOpts,
          presets: [...babelOpts.presets, require.resolve('@babel/preset-typescript')],
        });
    }
  });
};
