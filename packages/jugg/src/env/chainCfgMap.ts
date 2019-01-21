export enum Entry {
  INDEX = 'index',
}

export enum Plugin {
  /**
   * html-webpack-plugin
   */
  BASE_HTML_PLUGIN = 'html-webpack-plugin-base',
  /**
   * webpackbar
   */
  WEBPACKBAR_PLUGIN = 'webpackbar',
  FILTER_CSS_CONFLICT_WARNING_PLUGIN = 'filter-css-conflict-warning',
  FRIENDLY_ERRORS_PLUGIN = 'friendly-errors-webpack-plugin',
  DEFINE_PLUGIN = 'jugg-define-plugin',
  CASE_SENSITIVE_PATHS_PLUGIN = 'case-sensitive-paths',
  BUNDLE_ANALYZER = 'webpack-bundle-analyzer',
  HOT_MODULE_REPLACEMENT = 'hot-module-replacement-plugin',
  MINI_CSS_EXTRACT = 'mini-css-extract-plugin',
  CLEAN_WEBPACK_PLUGIN = 'clean-webpack-plugin',
  FORK_TS_CHECKER_PLUGIN = 'fork-ts-checker-webpack-plugin',
}

export enum Rule {
  IMAGES_RULE = 'images-url-loader-rule',
  SVG_RULE = 'svg-file-loader-rule',
  MEDIA_RULE = 'media-url-loader',
  FONTS_RULE = 'fonts-url-loader',
  TS_RULE = 'ts-rule',
  TSX_RULE = 'tsx-rule',
  JS_RULE = 'js-rule',
  JSX_RULE = 'jsx-rule',
  IMAGES_IMAGE_WEBPACK_LOADER_RULE = 'image-webpack-loader',
  CSS_MODULE_RULE = 'css.module',
  CSS_RULE = 'css',
  CSS_IN_NODE_MODULES_RULE = 'css-in-node_modules',
  LESS_MODULE_RULE = 'less.module',
  LESS_RULE = 'less',
  LESS_IN_NODE_MODULES_RULE = 'less-in-node_modules',
}

export enum Minimizer {
  OPTIMIZE_CSS_ASSETS = 'optimize-css-assets-webpack-plugin',
  UGLIFYJS_WEBPACK = 'uglifyjs-webpack-plugin',
}

export const CHAIN_CONFIG_MAP = {
  entry: Entry,
  plugin: Plugin,
  rule: Rule,
  minimizer: Minimizer,
};
