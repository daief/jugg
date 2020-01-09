/*
 * @Author: daief
 * @LastEditors  : daief
 * @Date: 2019-10-28 10:31:15
 * @LastEditTime : 2020-01-09 20:08:13
 * @Description:
 */
import memoryfs from 'memory-fs';
import path from 'path';
import webpack from 'webpack';

export default (fixture: string) => {
  const compiler = webpack({
    context: __dirname,
    entry: fixture,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.js', '.md'],
      alias: {
        fs: 'memfs',
      },
    },
    externals: {
      and: 'antd',
    },
    module: {
      rules: [
        {
          test: /\.md$/,
          use: {
            loader: path.resolve(__dirname, '../src/loader/md.ts'),
          },
        },
        {
          test: /\.(tsx|vue)?$/,
          use: {
            loader: path.resolve(__dirname, './tsx.loader.js'),
          },
        },
      ],
    },
  });

  // @ts-ignore
  compiler.outputFileSystem = new memoryfs();

  return new Promise<any>((resolve, reject) => {
    compiler.run((err, stats: any) => {
      if (err) {
        reject(err);
      }
      if (stats.hasErrors()) {
        reject(new Error(stats.toJson().errors));
      }

      resolve(stats);
    });
  });
};
