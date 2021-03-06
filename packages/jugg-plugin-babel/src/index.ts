import { PluginCfgSchema } from '@axew/jugg/types';
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { IJuggPreset } from './preset';

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

export enum BABEL_CHAIN_CONFIG_MAP {
  BABEL_JS_RULE = 'jugg-plugin-babel-js-rule',
  BABEL_TS_RULE = 'jugg-plugin-babel-ts-rule',
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

  const { cache, babelrc, presets, plugins, compileTs, juggPreset } = {
    ...dCfg,
    ...opts,
  };

  const babelOpts = {
    // default true
    cacheDirectory: cache,
    // default false
    babelrc,
    presets: [[require.resolve('./preset'), juggPreset], ...presets],
    plugins: [...plugins],
  };

  api.chainWebpack(({ config }) => {
    const { CHAIN_CONFIG_MAP, matchTranspileDependencies } = api.jugg.Utils;
    const { transpileDependencies } = api.jugg.JConfig;
    const cfgModule = config.module;

    const excludeFunc = (p: string) => {
      if (matchTranspileDependencies(transpileDependencies, p)) {
        return false;
      }
      return /node_modules/.test(p);
    };

    // rm ts-loader for js, jsx
    // check if user does not have a tsconfig.json
    cfgModule.rules.has(CHAIN_CONFIG_MAP.rule.JS_RULE) &&
      cfgModule.rule(CHAIN_CONFIG_MAP.rule.JS_RULE).uses.delete('ts-loader');
    cfgModule.rules.has(CHAIN_CONFIG_MAP.rule.JSX_RULE) &&
      cfgModule.rule(CHAIN_CONFIG_MAP.rule.JSX_RULE).uses.delete('ts-loader');

    // ------------------------- jsx? file babel config
    cfgModule
      .rule(BABEL_CHAIN_CONFIG_MAP.BABEL_JS_RULE)
      .test(/\.jsx?$/)
      .exclude.add(excludeFunc)
      .end()
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options(babelOpts);

    // use babel to compile typescript
    // ------------------------- tsx? file babel config
    if (compileTs === true) {
      // rm ts-loader for tsx?
      cfgModule.rule(CHAIN_CONFIG_MAP.rule.TS_RULE).uses.delete('ts-loader');
      cfgModule.rule(CHAIN_CONFIG_MAP.rule.TSX_RULE).uses.delete('ts-loader');

      cfgModule
        .rule(BABEL_CHAIN_CONFIG_MAP.BABEL_TS_RULE)
        .test(/\.tsx?$/)
        .exclude.add(excludeFunc)
        .end()
        .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options({
          ...babelOpts,
          presets: [
            ...babelOpts.presets,
            require.resolve('@babel/preset-typescript'),
          ],
        });

      // rm fork-ts-checker-webpack-plugin
      if (config.plugins.has(CHAIN_CONFIG_MAP.plugin.FORK_TS_CHECKER_PLUGIN)) {
        config.plugins.delete(CHAIN_CONFIG_MAP.plugin.FORK_TS_CHECKER_PLUGIN);
      }
    }
  });
};
