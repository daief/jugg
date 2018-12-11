import { Configuration } from 'webpack';
import { Configuration as DevConfiguration } from 'webpack-dev-server';
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

export interface DevOpts {
  port?: number;
  webpackConfig: Configuration;
  serverConfig?: DevConfiguration;
}

export type webpackChainFun = (
  param: {
    config: Config;
    webpack: Configuration;
  }
) => Config;

export type JuggWebpack = Configuration | webpackChainFun;

export interface JuggConfig {
  plugins?: Array<string | [string, { [k: string]: any }]>;
  webpack?: JuggWebpack;
}

export type Plugin = (jugg: Jugg, opts: any) => JuggConfig;
