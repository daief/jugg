/**
 * ref: @vue/cli-service@3.0.5/lib/commands/serve
 */
import WebpackDevServer, { Configuration as DevConfiguration } from 'webpack-dev-server';
import webpack, { Configuration } from 'webpack';
import { logger } from '../../utils/logger';
import portfinder from 'portfinder';
import { prepareUrls } from './prepareURL';
import url from 'url';
import chalk from 'chalk';
import { PluginAPI } from '../../PluginAPI';

export default function dev(api: PluginAPI) {
  api.registerCommand({
    command: 'dev',
    description: 'start dev server',
    option: [
      {
        flags: '-p, --port <port>',
        description: 'dev server port',
      },
    ],
    action: async (argv: any) => {
      const { JConfig } = api.jugg;
      const wbpCfg = api.jugg.mergeConfig();
      const { devServer = {} } = wbpCfg;
      const useDevServer: DevConfiguration = {
        ...devServer,
        port: argv.port || devServer.port || '3000',
        host: '0.0.0.0',
      };

      portfinder.basePort = useDevServer.port;
      const port = await portfinder.getPortPromise();
      const protocol = useDevServer.https ? 'https' : 'http';

      const urls = prepareUrls(protocol, useDevServer.host, port + '', JConfig.publicPath);

      const devClients = [
        // dev server client
        require.resolve(`webpack-dev-server/client`) +
          `?${url.format({
            protocol,
            port,
            hostname: urls.lanUrlForConfig || 'localhost',
            pathname: '/sockjs-node',
          })}`,
        // hmr client
        require.resolve(
          useDevServer.hotOnly === true ? 'webpack/hot/only-dev-server' : 'webpack/hot/dev-server'
        ),
      ];

      addDevClientToEntry(wbpCfg, devClients);

      const serverConfig: WebpackDevServer.Configuration = {
        disableHostCheck: true,
        compress: true,
        clientLogLevel: 'none',
        hot: true,
        quiet: true,
        contentBase: JConfig.outputDir,
        headers: {
          'access-control-allow-origin': '*',
        },
        publicPath: wbpCfg.output.publicPath,
        watchOptions: {
          ignored: /node_modules/,
        },
        historyApiFallback: false,
        overlay: true,
        ...useDevServer,
      };

      const compiler = webpack(wbpCfg);

      const server = new WebpackDevServer(compiler, serverConfig);

      server.listen(port, useDevServer.host, err => {
        if (err) {
          return logger.error(err);
        }
      });

      compiler.hooks.done.tap('jugg dev', stats => {
        if (stats.hasErrors()) {
          return;
        }

        logger.log(`\nThe App is running at`);
        logger.log(`  - Local:     ${chalk.cyan(urls.localUrlForTerminal)}`);
        logger.log(`  - Network:   ${chalk.cyan(urls.lanUrlForTerminal)}\n`);
      });
    },
  });
}

function addDevClientToEntry(config: Configuration, devClient: string[]) {
  const { entry } = config;
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    Object.keys(entry).forEach(key => {
      entry[key] = devClient.concat(entry[key]);
    });
  } else if (typeof entry === 'function') {
    config.entry = (entry as any)(devClient);
  } else {
    config.entry = devClient.concat(entry);
  }
}
