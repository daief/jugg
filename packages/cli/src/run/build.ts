import webpack from 'webpack';
import Jugg from '../Jugg';

export default function build(jugg: Jugg) {
  const wbpCfg: any = jugg.JConfig.webpack;
  const compiler = webpack(wbpCfg);
  // tslint:disable no-console
  console.log(wbpCfg);
  compiler.run(err => {
    if (err) {
      console.log('build err', err);
    }
    console.log('build success');
  });
}
