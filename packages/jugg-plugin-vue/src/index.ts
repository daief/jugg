import { PluginAPI } from '@axew/jugg/types/PluginAPI';

const NAME = 'jugg-plugin-vue';

export default (api: PluginAPI, vueLoaderOpts: any) => {
  api.chainWebpack(({ config }) => {
    // vue-loader
    config.module
      .rule(`${NAME}-rule`)
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
    config.plugin(`${NAME}-loader`).use(require('vue-loader/lib/plugin'));

    if (api.resolve('tsconfig.json')) {
      // ts env
      // https://github.com/TypeStrong/ts-loader#appendtsxsuffixto-regexp-default
      config.module
        .rule('ts-rule')
        .use('ts-loader')
        .tap(c => ({
          ...c,
          appendTsSuffixTo: ['\\.vue$'],
        }));

      config.module
        .rule('tsx-rule')
        .use('ts-loader')
        .tap(c => ({
          ...c,
          appendTsxSuffixTo: ['\\.vue$'],
        }));
    }
  });
};
