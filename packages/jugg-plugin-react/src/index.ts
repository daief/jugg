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
    const JS_BABEL = 'jugg-plugin-babel-rule';
    const TS_BABEL = 'jugg-plugin-babel-ts-rule';

    if (config.module.rules.has(JS_BABEL)) {
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
        .rule(JS_BABEL)
        .use('babel-loader')
        .tap(tapOptions);

      if (config.module.rules.has(TS_BABEL)) {
        config.module
          .rule(TS_BABEL)
          .use('babel-loader')
          .tap(tapOptions);
      }
    } else {
      api.jugg.Utils.logger.error('`jugg-plugin-react` works with `jugg-plugin-babel`');
    }
  });
};
