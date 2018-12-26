import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { JReactPresetOption } from './preset';

export interface Options {
  jReactPresetOption?: JReactPresetOption;
}

/**
 * if need to expand babel, you'd better make options on  `jugg-plugin-babel`
 */
export default (api: PluginAPI, opts: Options) => {
  const { jReactPresetOption } = opts;

  api.chainWebpack(({ config }) => {
    if (config.module.rules.has('jugg-plugin-babel-rule')) {
      config.module
        .rule('jugg-plugin-babel-rule')
        // ---------------------------- works with jugg-plugin-babel
        // .test(/\.jsx?$/)
        // .exclude.add(filepath => /node_modules/.test(filepath))
        // .end()
        .use('babel-loader')
        .tap(c => {
          const { presets } = c;
          return {
            ...c,
            presets: [...(presets || []), [require.resolve('./preset'), jReactPresetOption]],
          };
        });
    } else {
      api.jugg.Utils.logger.error('`jugg-plugin-react` works with `jugg-plugin-babel`');
    }
  });
};
