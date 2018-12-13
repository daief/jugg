import { JuggConfig, WebpackChainFun } from './interface';
import Config from 'webpack-chain';
// import resolveCwd from 'resolve-cwd';
import path from 'path';
import { Configuration } from 'webpack';
import cosmiconfig from 'cosmiconfig';
import TypeScriptLoader from './others/readTs';

export function readConfig(): Promise<JuggConfig> {
  return loadConfig('jugg');
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

/**
 * load a config, async
 * @param name
 */
export function loadConfig(name: string): Promise<any> {
  const explorer = cosmiconfig(name, {
    searchPlaces: [
      `.${name}rc`,
      `.${name}rc.json`,
      `.${name}rc.yaml`,
      `.${name}rc.yml`,
      `.${name}rc.js`,
      `.${name}rc.ts`,
      `${name}.config.js`,
    ],
    loaders: {
      '.ts': {
        async: TypeScriptLoader,
      },
      noExt: cosmiconfig.loadJs,
    },
  });

  return explorer
    .search()
    .then((result: any) => {
      return result ? result.config : {};
    })
    .catch((e: any) => {
      // tslint:disable no-console
      console.log('Read config error:', e);
      return {};
    });
}
