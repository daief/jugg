const less = require('less');
const { readFileSync } = require('fs');
const path = require('path');
const postcss = require('postcss');
const NpmImportPlugin = require('less-plugin-npm-import');
const rucksack = require('rucksack-css');
const autoprefixer = require('autoprefixer');

export default function transformLess(lessFile: string, config: any = {}): Promise<any> {
  const { cwd = process.cwd() } = config;
  const resolvedLessFile = path.resolve(cwd, lessFile);

  let data = readFileSync(resolvedLessFile, 'utf-8');
  data = data.replace(/^\uFEFF/, '');

  // Do less compile
  const lessOpts = {
    paths: [path.dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    plugins: [new NpmImportPlugin({ prefix: '~' })],
    javascriptEnabled: true,
  };
  return (
    less
      .render(data, lessOpts)
      // @ts-ignore
      .then(result =>
        postcss([
          rucksack(),
          autoprefixer({
            browsers: [
              'last 2 versions',
              'Firefox ESR',
              '> 1%',
              'ie >= 9',
              'iOS >= 8',
              'Android >= 4',
            ],
          }),
        ]).process(result.css, { from: undefined })
      )
      // @ts-ignore
      .then(r => r.css)
  );
}
