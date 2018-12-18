import webpack, { Stats } from 'webpack';
import { formatStats } from './formatStats';
import { PluginAPI } from '../../PluginAPI';

export default function build(api: PluginAPI) {
  api.registerCommand({
    command: 'build',
    description: 'exec build',
    env: {
      NODE_ENV: 'production',
    },
    action: () => {
      // const wbpCfg = api.jugg.JConfig.webpack as Configuration;
      const wbpCfg = api.jugg.mergeConfig();
      const compiler = webpack(wbpCfg);
      // tslint:disable no-console
      compiler.run((err, stats: Stats) => {
        if (err) {
          return console.log('build err', err);
        }

        console.log(formatStats(stats, api.jugg), '\nbuild success');
      });
    },
  });
}
