import { JuggConfig, JuggWebpack } from './interface';
import Config from 'webpack-chain';
import resolveCwd from 'resolve-cwd';
import path from 'path';

export function readConfig(): JuggConfig {
  // XXX
  const cfgPath = './.juggrc.js';
  return resolveCwd.silent(cfgPath) ? require(resolveCwd(cfgPath)) || {} : {};
}

export function mergeJuggWebpack(config: Config, cfgs: JuggWebpack[]): JuggWebpack {
  cfgs.map(wbp => {
    if (typeof wbp === 'function') {
      config.merge(wbp({ config, webpack: config.toConfig() }).toConfig());
    } else {
      config.merge(wbp);
    }
  });
  return config.toConfig();
}

export function getAbsolutePath(...p: string[]) {
  return path.join(process.cwd(), ...p);
}
