/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-05-29 09:58:00
 * @Description:
 */
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import gulpfile, { IOptions } from './gulpfile';
import { runTask } from './runTask';

export default function(api: PluginAPI, opts: IOptions = {}) {
  api.registerCommand({
    command: 'lib',
    description: 'build lib/ & es/ dir from src/',
    option: [
      {
        flags: '-E, --no-es',
        description: 'disable output es dir',
      },
      {
        flags: '-W, --watch',
        description: 'watch files change',
      },
    ],
    action: arg => {
      const { es, watch } = arg;
      gulpfile(opts, api);
      if (watch) {
        return runTask(es ? 'watch' : 'watch-to-lib');
      }
      runTask(es ? 'compile' : 'compile-with-lib');
    },
  });
}

export { default as tsConvertImportFrom } from './tsConvertImportFrom';
