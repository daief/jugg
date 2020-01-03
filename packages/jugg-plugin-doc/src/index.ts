/*
 * @Author: daief
 * @LastEditors  : daief
 * @Date: 2019-05-29 09:58:00
 * @Description:
 */
import { CHAIN_CONFIG_MAP, commands } from '@axew/jugg';
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import * as path from 'path';

export default function(api: PluginAPI, _ = {}) {
  const { jugg } = api;
  jugg.WebpackOptionsManager.addFilter((id, pre) => {
    if (id === CHAIN_CONFIG_MAP.plugin.BASE_HTML_PLUGIN) {
      pre[0].template = path.resolve(__dirname, '../site/index.ejs');
      return pre;
    }

    return pre;
  });

  jugg.JConfig!.tsCustomTransformers!.before =
    jugg.JConfig!.tsCustomTransformers!.before || [];
  jugg.JConfig!.tsCustomTransformers!.before!.push([
    'ts-import-plugin',
    { libraryName: 'antd', libraryDirectory: 'lib', style: true },
  ]);

  api.registerCommand({
    command: 'doc',
    description: 'build documents',
    option: [
      {
        flags: '-D, --dev',
        description: 'start development server',
        defaultValue: false,
      },
    ],
    action: (args: IArgOpts) => {
      if (args.dev) {
        // tslint:disable-next-line: no-console
        console.log('Doc dev');
        commands.dev(api, { noDevClients: false });
      }
    },
  });

  api.chainWebpack(({ config }) => {
    config
      .entry(CHAIN_CONFIG_MAP.entry.INDEX)
      .clear()
      .add(path.resolve(__dirname, '../site/index'));

    config.resolve.alias.set('site', path.resolve(__dirname, '../site'));
  });
}

export interface IArgOpts {
  dev: boolean;
}
