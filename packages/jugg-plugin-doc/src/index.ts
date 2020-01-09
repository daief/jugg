/*
 * @Author: daief
 * @LastEditors  : daief
 * @Date: 2019-05-29 09:58:00
 * @Description:
 */
import { CHAIN_CONFIG_MAP, commands } from '@axew/jugg';
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import { fork } from 'child_process';
import * as path from 'path';
import { IArgOpts, IOptions } from './interface';
import { findMarkdowns, generateDataSourceFile, guardOptions } from './utils';

export default function(api: PluginAPI, arg2: IOptions = {}) {
  const options = guardOptions(arg2);
  const { jugg } = api;
  const cwd = jugg.context;

  api.jugg.onWatchConfigChange(key => {
    if (key) {
      jugg.Utils.logger.info(
        `[${key}] changed. Restart the server to see the changes in effect.`,
      );
    }
  });

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

  api.chainJuggConfig(config => {
    const { tsCustomTransformers, define, transpileDependencies } = config;
    tsCustomTransformers!.before = tsCustomTransformers!.before || [];
    tsCustomTransformers!.before!.push([
      'ts-import-plugin',
      { libraryName: 'antd', libraryDirectory: 'lib', style: true },
    ]);
    return {
      ...config,
      outputDir: 'siteDist',
      tsCustomTransformers,
      transpileDependencies:
        typeof transpileDependencies === 'function'
          ? p => transpileDependencies(p) || /jugg-plugin-doc/i.test(p)
          : [...transpileDependencies, /jugg-plugin-doc/i],
      define: {
        ...define,
        THEME_CONFIG: {
          title: options.title,
          description: options.description,
          ...define!.THEME_CONFIG,
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
      const MDS_MODULE_NAME = path.resolve(__dirname, '../site/mds.tsx');
      // generate first time
      generateDataSourceFile({
        source: findMarkdowns({
          cwd,
          source: options.source,
        }),
        cwd,
        filename: MDS_MODULE_NAME,
      });

      if (args.dev) {
        commands.dev(api, { noDevClients: false }).then(() => {
          const child = fork(
            path.resolve(__dirname, './fork/watch'),
            process.argv,
          );
          child.send({
            type: 'INIT_WATCH',
            data: {
              ...options,
              cwd,
              MDS_MODULE_NAME,
            },
          });
        });
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
