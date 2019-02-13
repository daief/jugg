import { PluginAPI } from '@axew/jugg/types/PluginAPI';

export enum VUE_CHAIN_CONFIG_MAP {
  VUE_RULE = 'jugg-plugin-vue-rule',
  VUE_PLUGIN = 'jugg-plugin-vue-PLUGIN',
}

export default (api: PluginAPI, vueLoaderOpts: any) => {
  const { CHAIN_CONFIG_MAP } = api.jugg.Utils;
  const { plugin } = CHAIN_CONFIG_MAP;

  api.chainWebpack(({ config }) => {
    const cfgModule = config.module;
    // vue-loader
    cfgModule
      .rule(VUE_CHAIN_CONFIG_MAP.VUE_RULE)
      .test(/\.vue$/)
      .use('vue-loader')
      .loader('vue-loader')
      .options({
        compilerOptions: {
          preserveWhitespace: false,
        },
        ...vueLoaderOpts,
      })
      .end();

    // vue-loader-plugin
    config.plugin(VUE_CHAIN_CONFIG_MAP.VUE_PLUGIN).use(require('vue-loader/lib/plugin'));

    // modify fork-ts-checker-webpack-plugin config
    if (config.plugins.has(plugin.FORK_TS_CHECKER_PLUGIN)) {
      config.plugin(plugin.FORK_TS_CHECKER_PLUGIN).tap(c => [
        {
          ...c[0],
          vue: true,
        },
      ]);
    }

    if (api.resolve('tsconfig.json')) {
      // ts env
      // https://github.com/TypeStrong/ts-loader#appendtsxsuffixto-regexp-default
      cfgModule
        .rule(CHAIN_CONFIG_MAP.rule.TS_RULE)
        .use('ts-loader')
        .tap(c => ({
          ...c,
          appendTsSuffixTo: ['\\.vue$'],
        }));

      cfgModule
        .rule(CHAIN_CONFIG_MAP.rule.TSX_RULE)
        .use('ts-loader')
        .tap(c => ({
          ...c,
          appendTsxSuffixTo: ['\\.vue$'],
        }));
    }
  });
};
