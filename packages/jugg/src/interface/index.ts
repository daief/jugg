import { Configuration } from 'webpack';
import Config from 'webpack-chain';
import { PluginAPI } from '../PluginAPI';

export interface CommandSchema {
  command: string;
  description?: string;
  option?: Array<{
    flags: string;
    description?: string;
    fn?: ((arg1: any, arg2: any) => void) | RegExp;
    defaultValue?: any;
  }>;
  action?: (args: any) => void;
}

export type WebpackChainFun = (
  param: {
    config: Config;
    webpack: Configuration;
  },
) => void | Configuration;

export type JuggWebpack = Configuration | WebpackChainFun;

export interface JuggConfig {
  /**
   * publicPath of webpack, default '/'
   */
  publicPath?: string;
  /**
   * output path of webpack, default 'dist'
   */
  outputDir?: string;
  plugins?: PluginCfgSchema[];
  define?: { [k: string]: any };
  /**
   * open chunks config? default true
   */
  chunks?: boolean;
  /**
   * sourceMap, default true
   */
  sourceMap?: boolean;
  webpack?: JuggWebpack;
  /**
   * ts-loader custom transformers, only work when ts-loader is enabled
   */
  tsCustomTransformers?: {
    before?: PluginCfgSchema[];
    after?: PluginCfgSchema[];
  };
  /**
   * set bundle file name in production env, default `[name].[chunkhash]`.
   * affect js, css.
   */
  filename?: string;
  /**
   * built-in base webpack html plugin config.
   * set false to rm plugin.
   */
  html?: false | KeyValuePair;
  /**
   * config of css, less, postcss...
   */
  css?: {
    loaderOptions?: {
      /**
       * https://github.com/webpack-contrib/css-loader#options
       */
      css?: any;
      /**
       * http://lesscss.org/usage/#command-line-usage-options
       */
      less?: any;
      /**
       * https://github.com/postcss/postcss-loader/tree/v3.0.0#options
       * when `false`, disable the `postcss`
       */
      postcss?:
        | {
            config?: {
              context?: any;
              path?: any;
            };
            /**
             * when `false`, disable built-in plugins
             */
            plugins?: any;
            [k: string]: any;
          }
        | false;
    };
  };
  /**
   * add dependencies to compile by ts-loader or babel
   * if item is string, it will be convert a regex such as `join('node_modules', item, '/')`
   * @since 0.1.1
   */
  transpileDependencies?: Array<string | RegExp> | ((pth: string) => boolean);
}

export type Plugin = (api: PluginAPI, opts: any) => void;

export type PluginCfgSchema = string | [string, { [k: string]: any }?];

export interface KeyValuePair<T = any> {
  [k: string]: T;
}

export interface JuggGlobalCommandOpts {
  /**
   * specified configuration file path
   */
  configFilePath?: string;
}
