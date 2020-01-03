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
    switch (id) {
      case CHAIN_CONFIG_MAP.plugin.BASE_HTML_PLUGIN: {
        pre[0].template = path.resolve(__dirname, '../site/index.ejs');
        return pre;
      }
      default:
        return pre;
    }
  });

  api.chainJuggConfig((config: any) => {
    const { tsCustomTransformers, define } = config;
    tsCustomTransformers.before = tsCustomTransformers.before || [];
    tsCustomTransformers.before.push([
      'ts-import-plugin',
      { libraryName: 'antd', libraryDirectory: 'lib', style: true },
    ]);
    return {
      ...config,
      outputDir: 'siteDist',
      tsCustomTransformers,
      define: {
        ...define,
        THEME_CONFIG: {
          title: 'Document site title',
          description: 'Document site description',
          ...define.THEME_CONFIG,
        },
      },
    };
  });

  api.registerCommand({
    command: 'doc',
    description: 'build documents',
    option: [
      {
        flags: '-D, --dev',
        description: 'start development server',
        defaultValue: true,
      },
      {
        flags: '-B, --build',
        description: 'build document site',
        defaultValue: false,
      },
    ],
    action: (args: IArgOpts) => {
      if (args.dev) {
        commands.dev(api, { noDevClients: false });
      } else if (args.build) {
        commands.build(api);
      }
    },
  });

  api.chainWebpack(({ config }) => {
    config
      .entry(CHAIN_CONFIG_MAP.entry.INDEX)
      .clear()
      .add(path.resolve(__dirname, '../site/index'));

    config.module
      .rule('md-rule')
      .test(/\.md/)
      .use('jugg-md-loader')
      .loader(path.resolve(__dirname, './loader/md'));

    config.resolve.alias.set('site', path.resolve(__dirname, '../site'));
  });
}

export interface IArgOpts {
  dev: boolean;
  build: boolean;
}
