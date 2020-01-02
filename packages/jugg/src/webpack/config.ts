import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { existsSync, lstatSync } from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCss from 'mini-css-extract-plugin';
import webpack from 'webpack';
import Config from 'webpack-chain';
import Webpackbar from 'webpackbar';
import { Jugg } from '..';
import { Entry, Other, Plugin, Rule } from '../env/chainCfgMap';
import { FilterCSSConflictingWarning } from '../env/plugins';
import { matchTranspileDependencies } from '../utils/matchTranspileDependencies';

export default (jugg: Jugg): Config => {
  const config = new Config();
  const { Utils, WebpackOptionsManager, JConfig } = jugg;
  const { getAbsolutePath } = Utils;
  const { html } = JConfig;

  !(config as any).mode(process.env.NODE_ENV);

  config.context(jugg.context);

  // entry
  config
    .entry(Entry.INDEX)
    .add(WebpackOptionsManager.findOpts(Entry.INDEX))
    .end();

  // output
  const outputOpts = WebpackOptionsManager.findOpts(Other.OUTPUT);
  config.output
    .path(outputOpts.path)
    .filename(outputOpts.filename)
    .chunkFilename(outputOpts.chunkFilename)
    .publicPath(outputOpts.publicPath);

  // extensions
  config.resolve.extensions.merge(['.js', '.jsx', '.ts', '.tsx', '.vue']);

  // alias
  config.resolve.alias.set('@', getAbsolutePath('src'));

  // plugin filter-css-conflict-warning
  config
    .plugin(Plugin.FILTER_CSS_CONFLICT_WARNING_PLUGIN)
    .use(
      FilterCSSConflictingWarning,
      WebpackOptionsManager.findOpts(Plugin.FILTER_CSS_CONFLICT_WARNING_PLUGIN),
    );

  // plugin friendly-error
  config
    .plugin(Plugin.FRIENDLY_ERRORS_PLUGIN)
    .use(
      FriendlyErrorsWebpackPlugin,
      WebpackOptionsManager.findOpts(Plugin.FRIENDLY_ERRORS_PLUGIN),
    );

  // plugin webpack-define
  config
    .plugin(Plugin.DEFINE_PLUGIN)
    .use(
      webpack.DefinePlugin,
      WebpackOptionsManager.findOpts(Plugin.DEFINE_PLUGIN),
    );

  // plugin case-sensitive-paths
  config
    .plugin(Plugin.CASE_SENSITIVE_PATHS_PLUGIN)
    .use(
      CaseSensitivePathsPlugin,
      WebpackOptionsManager.findOpts(Plugin.CASE_SENSITIVE_PATHS_PLUGIN),
    );

  // loader images url-loader
  config.module
    // --------------- images url-loader
    .rule(Rule.IMAGES_RULE)
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options(WebpackOptionsManager.findOpts(Rule.IMAGES_RULE));

  // loader svg file-loader
  config.module
    .rule(Rule.SVG_RULE)
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader(require.resolve('file-loader'))
    .options(WebpackOptionsManager.findOpts(Rule.SVG_RULE));

  // loader media url-loader
  config.module
    .rule(Rule.MEDIA_RULE)
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options(WebpackOptionsManager.findOpts(Rule.MEDIA_RULE));

  // loader fonts url-loader
  config.module
    .rule(Rule.FONTS_RULE)
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader('url-loader')
    .options(WebpackOptionsManager.findOpts(Rule.FONTS_RULE));

  // ts
  resolveTS(config, jugg);

  // style
  resolveStyle(config, jugg);

  // plugin html-webpack-plugin
  if (html !== false) {
    config
      .plugin(Plugin.BASE_HTML_PLUGIN)
      .use(
        HtmlWebpackPlugin,
        WebpackOptionsManager.findOpts(Plugin.BASE_HTML_PLUGIN),
      );
  }

  // plugin webpack-bundle-analyzer
  if (process.env.ANALYZE) {
    config
      .plugin(Plugin.BUNDLE_ANALYZER)
      .use(
        require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
        WebpackOptionsManager.findOpts(Plugin.BUNDLE_ANALYZER),
      );
  }

  // plugin hard-source-webpack-plugin
  if (process.env.HARD_SOURCE !== 'none') {
    config
      .plugin(Plugin.HARD_SOURCE_PLUGIN)
      .use(
        require('hard-source-webpack-plugin'),
        WebpackOptionsManager.findOpts(Plugin.HARD_SOURCE_PLUGIN),
      );
  }

  // plugin Webpackbar
  if (!process.env.NO_WEBPACKBAR) {
    config
      .plugin(Plugin.WEBPACKBAR_PLUGIN)
      .use(
        Webpackbar,
        WebpackOptionsManager.findOpts(Plugin.WEBPACKBAR_PLUGIN),
      );
  }

  // plugin mini-css-extract-plugin
  config
    .plugin(Plugin.MINI_CSS_EXTRACT)
    .use(MiniCss, WebpackOptionsManager.findOpts(Plugin.MINI_CSS_EXTRACT));

  return config;
};

function resolveTS(config: Config, jugg: Jugg) {
  const { getAbsolutePath } = jugg.Utils;
  // ts project
  const TS_CONFIG_FILE = getAbsolutePath(
    process.env.JUGG_TS_PROJECT || 'tsconfig.json',
  );
  // tsconfig not exist
  if (!(existsSync(TS_CONFIG_FILE) && lstatSync(TS_CONFIG_FILE).isFile())) {
    return;
  }

  const { transpileDependencies } = jugg.JConfig;
  const setTsLoader = (param: { rule: Rule; test: RegExp }) => {
    const { rule, test } = param;

    const exclude = (path: string) => {
      if (matchTranspileDependencies(transpileDependencies, path)) {
        return false;
      }
      return /node_modules/.test(path);
    };

    config.module
      .rule(rule)
      .test(test)
      .exclude.add(exclude)
      .end()
      .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .options(jugg.WebpackOptionsManager.findOpts(rule));
  };

  // loader ts ts-loader
  setTsLoader({
    rule: Rule.TS_RULE,
    test: /\.ts$/,
  });

  // --------------- ts-loader, tsx
  setTsLoader({
    rule: Rule.TSX_RULE,
    test: /\.tsx$/,
  });

  // --------------- ts-loader, js
  setTsLoader({
    rule: Rule.JS_RULE,
    test: /\.js$/,
  });

  // --------------- ts-loader, jsx
  setTsLoader({
    rule: Rule.JSX_RULE,
    test: /\.jsx$/,
  });

  if (process.env.FORK_TS_CHECKER !== 'none') {
    // plugin fork-ts-checker-webpack-plugin
    config
      .plugin(Plugin.FORK_TS_CHECKER_PLUGIN)
      .use(
        require('fork-ts-checker-webpack-plugin'),
        jugg.WebpackOptionsManager.findOpts(Plugin.FORK_TS_CHECKER_PLUGIN),
      );
  }
}

function resolveStyle(config: Config, jugg: Jugg) {
  const { IsProd, WebpackOptionsManager } = jugg;

  function cssExclude(filePath: string) {
    if (/node_modules/.test(filePath)) {
      return true;
    }

    if (/\.module\.(css|less|sass|scss)$/.test(filePath)) {
      return true;
    }

    return false;
  }

  // --------------- support css & less
  function setCssLoaders(rule: Config.Rule, ruleId: Rule) {
    const { css } = jugg.JConfig;
    const { postcss } = css.loaderOptions;

    const {
      less,
      cssHotLoader,
      extractCssLoader,
      cssLoader,
      postcssLoader,
      lessLoader,
    } = WebpackOptionsManager.findOpts(ruleId);

    if (!IsProd) {
      rule
        .use('css-hot-loader')
        .loader(require.resolve('css-hot-loader'))
        .options(cssHotLoader);
    }

    // notice the order
    // remember to add plugin
    rule
      .use('extract-css-loader')
      .loader(require('mini-css-extract-plugin').loader)
      .options(extractCssLoader);

    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options(cssLoader);

    if (postcss !== false) {
      rule
        .use('postcss-loader')
        .loader(require.resolve('postcss-loader'))
        .options(postcssLoader);
    }

    if (less === true) {
      rule
        .use('less-loader')
        .loader(require.resolve('less-loader'))
        .options(lessLoader);
    }
  }

  // --------------- css ---------------
  setCssLoaders(
    config.module
      .rule(Rule.CSS_MODULE_RULE)
      .test(/\.module\.css$/i)
      .exclude.add(path => /node_modules/i.test(path))
      .end(),
    Rule.CSS_MODULE_RULE,
  );

  setCssLoaders(
    config.module
      .rule(Rule.CSS_RULE)
      .test(/\.css$/i)
      .exclude.add(cssExclude)
      .end(),
    Rule.CSS_RULE,
  );

  setCssLoaders(
    config.module
      .rule(Rule.CSS_IN_NODE_MODULES_RULE)
      .test(/\.css$/i)
      .include.add(/node_modules/)
      .end(),
    Rule.CSS_IN_NODE_MODULES_RULE,
  );

  // --------------- less ---------------
  setCssLoaders(
    config.module
      .rule(Rule.LESS_MODULE_RULE)
      .test(/\.module\.less$/i)
      .exclude.add(path => /node_modules/i.test(path))
      .end(),
    Rule.LESS_MODULE_RULE,
  );

  setCssLoaders(
    config.module
      .rule(Rule.LESS_RULE)
      .test(/\.less$/i)
      .exclude.add(cssExclude)
      .end(),
    Rule.LESS_RULE,
  );

  setCssLoaders(
    config.module
      .rule(Rule.LESS_IN_NODE_MODULES_RULE)
      .test(/\.less$/i)
      .include.add(/node_modules/)
      .end(),
    Rule.LESS_IN_NODE_MODULES_RULE,
  );
}
