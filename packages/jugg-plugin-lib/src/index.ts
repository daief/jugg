import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { runTask } from './runTask';
import gulpfile, { IOptions } from './gulpfile';

export default function(api: PluginAPI, opts: IOptions = {}) {
  api.registerCommand({
    command: 'lib',
    description: 'build lib/ & es/ dir from src/',
    option: [
      {
        flags: '-E, --no-es',
        description: 'disable output es dir',
      },
    ],
    action: arg => {
      const { es } = arg;
      gulpfile(opts, api);
      runTask(es === true ? 'compile' : 'compile-with-lib');
    },
  });
}

export { default as tsConvertImportFrom } from './tsConvertImportFrom';
