import cosmiconfig from 'cosmiconfig';
import { defaultsDeep } from 'lodash';
import { Jugg } from '..';
import { JuggConfig } from '../interface';
import { defaults, PROP_COMPARE, validateConfig } from './jConfigSchema';
import { logger } from './logger';
import TypeScriptLoader from './readTs';

export function readConfig(
  jugg: Jugg,
): {
  config: JuggConfig;
  configFilePath: string;
} {
  const { configFilePath } = jugg.JGlobalCommandOpts;
  const absPath = jugg.Utils.getAbsolutePath(configFilePath);
  const { config, filepath } = configFilePath
    ? {
        // use `TypeScriptLoader` to disable cache
        config: TypeScriptLoader(absPath),
        filepath: absPath,
      }
    : loadConfig<JuggConfig>('jugg');

  const info = validateConfig(config);
  if (info.error) {
    logger.error(`Invalid options: ${info.error.message}`, filepath);
    process.exit(1);
  }

  return {
    config: defaultsDeep(config, defaults()),
    configFilePath: filepath,
  };
}

/**
 * only a helper to hint jugg config item
 * @param cfg config of jugg
 */
export const extendConfig = (cfg: JuggConfig): JuggConfig => cfg;

/**
 * project search file
 * @param name project name
 */
export function searchPlaces(name: string) {
  return [`.${name}rc.js`, `${name}.config.js`, `.${name}rc.ts`, `.${name}rc`];
}

/**
 * load a default path config, sync
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
export function isUserConfigChanged(jugg: Jugg): false | keyof JuggConfig {
  const { JConfig: config } = jugg;
  const { config: newCfg } = readConfig(jugg);

  let result: false | string = false;

  Object.keys(newCfg).forEach((key: keyof JuggConfig) => {
    const doCompare = PROP_COMPARE[key];

    if (result) {
      // no more compare
      return;
    }

    result =
      (doCompare === undefined
        ? newCfg[key] !== config[key]
        : !doCompare(newCfg[key], config[key], jugg)) && key;
  });

  return result;
}

/**
 * 打印项目的一些信息，在插件加载完毕、执行命令语句前执行
 * @param jugg
 */
export function printProjectInfo(jugg: Jugg) {
  const { ConfigFileManager } = jugg;

  logger.info(`Context at: ${jugg.context}`, 'jugg');

  if (ConfigFileManager.Tsconfig) {
    logger.info(`Using tsconfig at: ${ConfigFileManager.Tsconfig}`, 'jugg');
  }

  logger.info(
    `Plugins loaded: \n${jugg
      .getPlugins(false)
      .map(_ => _[0])
      .join('\n')}`,
    'jugg',
  );
}
