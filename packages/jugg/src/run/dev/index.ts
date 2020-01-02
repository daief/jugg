/**
 * ref: @vue/cli-service@3.0.5/lib/commands/serve
 */
import chalk from 'chalk';
import portfinder from 'portfinder';
import webpack from 'webpack';
import WebpackDevServer, {
  Configuration as DevConfiguration,
} from 'webpack-dev-server';
import { PluginAPI } from '../../PluginAPI';
import { logger } from '../../utils/logger';
import { prepareUrls } from './prepareURL';

export default function dev(api: PluginAPI) {
  let server: WebpackDevServer = null;

  function addFileWatch() {
    // listen to config change
    api.jugg.onWatchConfigChange(key => {
      if (server && key) {
        logger.log('');
        logger.info('try to restart server...\n', `${key} changed`);

        server.close(() => {
          server = null;
          api.jugg.reload();
        });
      }
    });
  }

  api.registerCommand({
    command: 'dev',
    description: 'start dev server',
    option: [
      {
        flags: '-p, --port [port]',
        description: 'dev server port',
      },
    ],
    action: async (args: ArgOpts) => {
      addFileWatch();
      server = await excute(api, args);
    },
  });
}

export async function excute(api: PluginAPI, argv: ArgOpts) {
  const { JConfig } = api.jugg;
  const wbpCfg = api.jugg.mergeConfig();
  const { devServer = {} } = wbpCfg;
  const useDevServer: DevConfiguration = {
    host: '0.0.0.0',
    ...devServer,
    port: argv.port || devServer.port || 3000,
  };

  portfinder.basePort = useDevServer.port;
  const port = await portfinder.getPortPromise();
  useDevServer.port = port;
  const protocol = useDevServer.https ? 'https' : 'http';

  const urls = prepareUrls(
    protocol,
    useDevServer.host,
    port + '',
    JConfig.publicPath,
  );

  // if (argv.noDevClients === false) {
  //   const devClients = [
  //     // dev server client
  //     require.resolve(`webpack-dev-server/client`) +
  //       `?${url.format({
  //         protocol,
  //         port,
  //         hostname: urls.lanUrlForConfig || 'localhost',
  //         pathname: '/sockjs-node',
  //       })}`,
  //     // hmr client
  //     require.resolve(
  //       useDevServer.hotOnly === true
  //         ? 'webpack/hot/only-dev-server'
  //         : 'webpack/hot/dev-server',
  //     ),
  //   ];

  //   addDevClientToEntry(wbpCfg, devClients);
  // }

  const serverConfig: WebpackDevServer.Configuration = {
    disableHostCheck: true,
    compress: true,
    clientLogLevel: 'none',
    hot: true,
    quiet: !process.env.NO_WEBPACKBAR,
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
    useLocalIp: true,
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

  return server;
}

// function addDevClientToEntry(config: Configuration, devClient: string[]) {
//   const { entry } = config;
//   if (typeof entry === 'object' && !Array.isArray(entry)) {
//     Object.keys(entry).forEach(key => {
//       entry[key] = devClient.concat(entry[key]);
//     });
//   } else if (typeof entry === 'function') {
//     config.entry = (entry as any)(devClient);
//   } else {
//     config.entry = devClient.concat(entry);
//   }
// }

interface ArgOpts {
  port?: number;
  /**
   * update webpack-dev-server >= 3.2.0, this is unnecessary
   * @deprecated
   */
  noDevClients: boolean;
}
