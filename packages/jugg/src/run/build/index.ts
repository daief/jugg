import webpack, { Configuration, Stats } from 'webpack';
import Jugg from '../../Jugg';
import { formatStats } from './formatStats';

export default function build(jugg: Jugg) {
  const wbpCfg = jugg.JConfig.webpack as Configuration;
  const compiler = webpack(wbpCfg);
  // tslint:disable no-console
  compiler.run((err, stats: Stats) => {
    if (err) {
      return console.log('build err', err);
    }

    console.log(formatStats(stats, jugg), '\nbuild success');
  });
}
