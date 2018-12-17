import Jugg from '../Jugg';
import WebpackDevServer from 'webpack-dev-server';
import webpack, { Configuration } from 'webpack';
import { getAbsolutePath } from '../utils';

export default function dev(jugg: Jugg, argv: any) {
  const { JConfig } = jugg;
  const wbpCfg = JConfig.webpack as Configuration;
  const compiler = webpack(wbpCfg);
  const { port } = argv;
  const HOST = '0.0.0.0';
  const serverConfig: WebpackDevServer.Configuration = {
    port,
    disableHostCheck: true,
    compress: true,
    clientLogLevel: 'none',
    hot: true,
    quiet: true,
    contentBase: getAbsolutePath(JConfig.outputDir),
    headers: {
      'access-control-allow-origin': '*',
    },
    publicPath: wbpCfg.output.publicPath,
    watchOptions: {
      ignored: /node_modules/,
    },
    historyApiFallback: false,
    overlay: true,
    host: HOST,
    ...(wbpCfg.devServer || {}),
  };
  const server = new WebpackDevServer(compiler, serverConfig);

  server.listen(port, HOST, err => {
    if (err) {
      // tslint:disable:no-console
      return console.log(err);
    }
  });
}
