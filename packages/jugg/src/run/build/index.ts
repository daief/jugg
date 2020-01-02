import webpack, { Stats } from 'webpack';
import { PluginAPI } from '../../PluginAPI';
import { formatStats } from './formatStats';

export default function build(api: PluginAPI) {
  api.registerCommand({
    command: 'build',
    description: 'exec build',
    action: () => {
      excute(api);
    },
  });
}

export function excute(api: PluginAPI) {
  const wbpCfg = api.jugg.mergeConfig();
  const compiler = webpack(wbpCfg);

  compiler.run((err, stats: Stats) => {
    if (err) {
      return api.jugg.Utils.logger.error(err, 'Build error: ');
    }

    api.jugg.Utils.logger.log(formatStats(stats, api.jugg));
    // do not exit process manually becauseof something like `webpack-bundle-analyzer`
    api.jugg.clean(false);
  });
  return compiler;
}
