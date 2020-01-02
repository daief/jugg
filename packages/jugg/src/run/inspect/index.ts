import highlight from 'cli-highlight';
import * as fs from 'fs';
import { toString } from 'webpack-chain';
import { PluginAPI } from '../../PluginAPI';

export default function build(api: PluginAPI) {
  const { jugg } = api;
  api.registerCommand({
    command: 'inspect',
    description: 'inspect webpack config',
    option: [
      {
        flags: '-P, --path [path]',
        description: 'a path file to write result',
      },
    ],
    action: (arg: { path?: string }) => {
      const { path: outputPath } = arg;
      const filePath = jugg.Utils.getAbsolutePath(outputPath);
      // @ts-ignore
      const result = toString(jugg.mergeConfig());
      if (outputPath) {
        try {
          fs.writeFileSync(filePath, result, 'utf-8');
          jugg.Utils.logger.info(`Done: ${filePath}`, 'jugg inspect');
        } catch (error) {
          jugg.Utils.logger.error(error, 'jugg inspect');
        }

        return;
      }
      // tslint:disable-next-line: no-console
      console.log(highlight(result, { language: 'js' }));
    },
  });
}
