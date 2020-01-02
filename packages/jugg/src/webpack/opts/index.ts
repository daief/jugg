import { Jugg } from '../..';

export const genUrlLoaderOptions = () => ({
  limit: 4096,
  // use explicit fallback to avoid regression in url-loader>=1.1.0
  fallback: {
    loader: 'file-loader',
    options: {
      name: 'static/[name].[hash:8].[ext]',
    },
  },
});

export const getTsOpts = (jugg: Jugg) => {
  const { tsCustomTransformers } = jugg.JConfig;
  const { getAbsolutePath, resolvePlugin } = jugg.Utils;
  const TS_CONFIG_FILE = getAbsolutePath(
    process.env.JUGG_TS_PROJECT || 'tsconfig.json',
  );
  const { before = [], after = [] } = tsCustomTransformers;
  const beforeTransformers = before.map(resolvePlugin);
  const afterTransformers = after.map(resolvePlugin);

  const tsOpts = {
    transpileOnly: true,
    happyPackMode: true,
    configFile: TS_CONFIG_FILE,
    getCustomTransformers: () => ({
      before: beforeTransformers,
      after: afterTransformers,
    }),
  };

  return tsOpts;
};

export const getStyleOpts = (jugg: Jugg, isModule: boolean) => {
  const { css } = jugg.JConfig;
  const { postcss } = css.loaderOptions;

  const cssModulesConfig = {
    modules: true,
    localIdentName: '[local]___[hash:base64:5]',
  };

  let postcssPlugins = {};
  if (postcss !== false) {
    postcssPlugins =
      Array.isArray(postcss.plugins) || !postcss.plugins
        ? () => {
            if (postcss.plugins === false) {
              return [];
            }
            return [
              require('postcss-flexbugs-fixes'),
              require('autoprefixer')({
                flexbox: 'no-2009',
              }),
              ...(postcss.plugins || []),
            ].filter(Boolean);
          }
        : postcss.plugins;
  }

  return {
    cssHotLoader: {},
    extractCssLoader: {},
    cssLoader: {
      ...(isModule ? cssModulesConfig : {}),
      ...css.loaderOptions.css,
    },
    postcssLoader: {
      ...postcss,
      plugins: postcssPlugins,
    },
    lessLoader: {
      javascriptEnabled: true,
      ...css.loaderOptions.less,
    },
  };
};
