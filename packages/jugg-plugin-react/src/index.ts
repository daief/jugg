import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { JReactPresetOption } from './preset';
import { BABEL_CHAIN_CONFIG_MAP } from '@axew/jugg-plugin-babel';

export interface Options {
  jReactPresetOption?: JReactPresetOption;
}

/**
 * if need to expand babel, you'd better make options on  `jugg-plugin-babel`
 */
export default (api: PluginAPI, opts: Options) => {
  const { jReactPresetOption } = opts;

  api.chainWebpack(({ config }) => {
    if (config.module.rules.has(BABEL_CHAIN_CONFIG_MAP.BABEL_JS_RULE)) {
      const tapOptions = (c: any = {}) => {
        const { presets, plugins } = c;
        return {
          ...c,
          presets: [[require.resolve('./preset'), jReactPresetOption], ...(presets || [])],
          plugins: [
            ...(plugins || []),
            // XXX works only set here, if set in `./preset`, it does not work
            require.resolve('react-hot-loader/babel'),
          ],
        };
      };

      config.module
        .rule(BABEL_CHAIN_CONFIG_MAP.BABEL_JS_RULE)
        .use('babel-loader')
        .tap(tapOptions);

      if (config.module.rules.has(BABEL_CHAIN_CONFIG_MAP.BABEL_TS_RULE)) {
        config.module
          .rule(BABEL_CHAIN_CONFIG_MAP.BABEL_TS_RULE)
          .use('babel-loader')
          .tap(tapOptions);
      }
    } else {
      api.jugg.Utils.logger.error('`jugg-plugin-react` works with `jugg-plugin-babel`');
    }
  });
};
