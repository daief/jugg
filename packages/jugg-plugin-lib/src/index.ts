import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { runTask } from './runTask';
import gulpfile, { IOptions } from './gulpfile';

export default function(api: PluginAPI, opts: IOptions = {}) {
  api.registerCommand({
    command: 'lib',
    description: 'build lib/ & es/ dir from src/',
    action: () => {
      gulpfile(opts, api);
      runTask('compile');
    },
  });
}
