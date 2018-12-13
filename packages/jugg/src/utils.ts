import { JuggConfig, WebpackChainFun } from './interface';
import Config from 'webpack-chain';
import resolveCwd from 'resolve-cwd';
import path from 'path';
import { Configuration } from 'webpack';

export function readConfig(): JuggConfig {
  // XXX
  const cfgPath = './.juggrc.js';
  return resolveCwd.silent(cfgPath) ? require(resolveCwd(cfgPath)) || {} : {};
}

export function mergeJuggWebpack(config: Config, cfgs: WebpackChainFun[]): Configuration {
  cfgs.map(fn => {
    fn({ config, webpack: config.toConfig() });
  });
  return config.toConfig();
}

export function getAbsolutePath(...p: string[]) {
  return path.join(process.cwd(), ...p);
}
