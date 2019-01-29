import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { runTask } from './runTask';
import gulpfile from './gulpfile';

export default function build(api: PluginAPI) {
  api.registerCommand({
    command: 'lib',
    description: 'build lib',
    action: () => {
      gulpfile({}, api);
      runTask('compile');
    },
  });
}
