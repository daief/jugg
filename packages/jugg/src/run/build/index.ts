import webpack, { Stats } from 'webpack';
import { formatStats } from './formatStats';
import { PluginAPI } from '../../PluginAPI';

export default function build(api: PluginAPI) {
  api.registerCommand({
    command: 'build',
    description: 'exec build',
    action: () => {
      const wbpCfg = api.jugg.mergeConfig();
      const compiler = webpack(wbpCfg);

      compiler.run((err, stats: Stats) => {
        if (err) {
          return api.jugg.Utils.logger.error(err, 'Build error: ');
        }

        api.jugg.Utils.logger.log(formatStats(stats, api.jugg));
        api.jugg.exit();
      });
    },
  });
}
