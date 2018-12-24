import { JuggConfig } from '../interface';
import path from 'path';
import cosmiconfig from 'cosmiconfig';
import TypeScriptLoader from './readTs';
import { logger } from './logger';

export function readConfig(): JuggConfig {
  const { publicPath, outputDir, plugins, webpack, define, chunks } = loadConfig(
    'jugg'
  ) as JuggConfig;

  return {
    publicPath: publicPath || '/',
    outputDir: outputDir || 'dist',
    plugins: plugins || [],
    webpack: webpack || {},
    define: define || {},
    chunks: chunks !== false ? true : false,
  };
}

export function getAbsolutePath(...p: string[]) {
  return path.join(process.cwd(), ...p);
}

/**
 * load a config, sync
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
        sync: TypeScriptLoader,
        // async: TypeScriptLoader,
      },
      noExt: cosmiconfig.loadJs,
    },
  });

  try {
    const result = explorer.searchSync();
    return result ? result.config : {};
  } catch (e) {
    logger.error(e, 'Read config error');
  }
}
