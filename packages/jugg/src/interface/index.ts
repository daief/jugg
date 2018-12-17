import { Configuration } from 'webpack';
import Config from 'webpack-chain';
import Jugg from '../Jugg';

export interface CommandSchema {
  command: string;
  description?: string;
  option?: Array<{
    flags: string;
    description?: string;
    fn?: ((arg1: any, arg2: any) => void) | RegExp;
    defaultValue?: any;
  }>;
  env?: {
    [key: string]: string;
  };
}

export type WebpackChainFun = (
  param: {
    config: Config;
    webpack: Configuration;
  }
) => void;

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
  plugins?: Array<string | [string, { [k: string]: any }]>;
  define?: { [k: string]: any };
  /**
   * open chunks config? default true
   */
  chunks?: boolean;
  webpack?: JuggWebpack;
}

export type Plugin = (jugg: Jugg, opts: any) => WebpackChainFun | void;
