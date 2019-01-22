import { PluginAPI } from '@axew/jugg/types/PluginAPI';

export enum VUE_CHAIN_CONFIG_MAP {
  VUE_RULE = 'jugg-plugin-vue-rule',
  VUE_PLUGIN = 'jugg-plugin-vue-PLUGIN',
}

export default (api: PluginAPI, vueLoaderOpts: any) => {
  const { CHAIN_CONFIG_MAP } = api.jugg.Utils;

  api.chainWebpack(({ config }) => {
    // vue-loader
    config.module
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

    if (api.resolve('tsconfig.json')) {
      // ts env
      // https://github.com/TypeStrong/ts-loader#appendtsxsuffixto-regexp-default
      config.module
        .rule(CHAIN_CONFIG_MAP.rule.TS_RULE)
        .use('ts-loader')
        .tap(c => ({
          ...c,
          appendTsSuffixTo: ['\\.vue$'],
        }));

      config.module
        .rule(CHAIN_CONFIG_MAP.rule.TSX_RULE)
        .use('ts-loader')
        .tap(c => ({
          ...c,
          appendTsxSuffixTo: ['\\.vue$'],
        }));
    }
  });
};
