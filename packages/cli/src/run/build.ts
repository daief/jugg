import webpack, { Configuration } from 'webpack';
import Jugg from '../Jugg';

export default function build(jugg: Jugg) {
  const wbpCfg = jugg.JConfig.webpack as Configuration;
  const compiler = webpack(wbpCfg);
  // tslint:disable no-console
  compiler.run(err => {
    if (err) {
      return console.log('build err', err);
    }
    console.log('build success');
  });
}
