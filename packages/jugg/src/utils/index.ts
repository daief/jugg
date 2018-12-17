import { JuggConfig } from '../interface';
import path from 'path';
import cosmiconfig from 'cosmiconfig';
import TypeScriptLoader from './readTs';

export function readConfig(): Promise<JuggConfig> {
  return loadConfig('jugg');
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
