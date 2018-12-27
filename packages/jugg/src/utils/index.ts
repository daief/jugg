import { JuggConfig } from '../interface';
import path from 'path';
import cosmiconfig from 'cosmiconfig';
import TypeScriptLoader from './readTs';
import { logger } from './logger';
import { defaultsDeep } from 'lodash';
import { validateConfig, defaults, PROP_COMPARE } from './jConfigSchema';

export function readConfig(): JuggConfig {
  const { config, filepath } = loadConfig<JuggConfig>('jugg');

  const info = validateConfig(config);
  if (info.error) {
    logger.error(`Invalid options: ${info.error.message}`, filepath);
    process.exit(1);
  }

  return defaultsDeep(config, defaults());
}

export function getAbsolutePath(...p: string[]) {
  return path.join(process.cwd(), ...p);
}

/**
 * load a config, sync
 * @param name
 */
export function loadConfig<T = any>(
  name: string
): {
  config: T;
  filepath: string;
} {
  const explorer = cosmiconfig(name, {
    searchPlaces: [
      `.${name}rc.js`,
      `${name}.config.js`,
      `.${name}rc.ts`,
      `.${name}rc`,
      `.${name}rc.json`,
      `.${name}rc.yaml`,
      `.${name}rc.yml`,
    ],
    cache: false,
    loaders: {
      '.ts': {
        sync: TypeScriptLoader,
      },
      noExt: cosmiconfig.loadJs,
    },
  });

  try {
    return (
      explorer.searchSync() || {
        config: {},
        filepath: '',
      }
    );
  } catch (e) {
    logger.error(e, 'Read config error');
  }
}

/**
 * 配置比较
 * @param config
 */
export function isUserConfigChanged(config: JuggConfig): boolean {
  const newCfg = readConfig();

  let result: false | string = false;

  Object.keys(newCfg).forEach(key => {
    const compare = PROP_COMPARE[key];

    if (result) {
      return;
    }

    result =
      (compare === undefined ? newCfg[key] !== config[key] : !compare(newCfg[key], config[key])) &&
      key;
  });

  return result;
}
