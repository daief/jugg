import cosmiconfig from 'cosmiconfig';
import { defaultsDeep } from 'lodash';
import { JuggConfig } from '../interface';
import { defaults, PROP_COMPARE, validateConfig } from './jConfigSchema';
import { logger } from './logger';
import TypeScriptLoader from './readTs';

export function readConfig(): JuggConfig {
  const { config, filepath } = loadConfig<JuggConfig>('jugg');

  const info = validateConfig(config);
  if (info.error) {
    logger.error(`Invalid options: ${info.error.message}`, filepath);
    process.exit(1);
  }

  return defaultsDeep(config, defaults());
}

export const extendConfig = (cfg: JuggConfig): JuggConfig => cfg;

/**
 * project search file
 * @param name project name
 */
export function searchPlaces(name: string) {
  return [
    `.${name}rc.js`,
    `${name}.config.js`,
    `.${name}rc.ts`,
    `.${name}rc`,
    `.${name}rc.json`,
    `.${name}rc.yaml`,
    `.${name}rc.yml`,
  ];
}

/**
 * load a config, sync
 * @param name
 */
export function loadConfig<T = any>(
  name: string,
): {
  config: T;
  filepath: string;
} {
  const explorer = cosmiconfig(name, {
    searchPlaces: searchPlaces(name),
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
    const doCompare = PROP_COMPARE[key];

    if (result) {
      // no more compare
      return;
    }

    result =
      (doCompare === undefined
        ? newCfg[key] !== config[key]
        : !doCompare(newCfg[key], config[key])) && key;
  });

  return result;
}
