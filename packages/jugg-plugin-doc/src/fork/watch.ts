import chokidar from 'chokidar';
import * as path from 'path';
import { IOptions } from '../interface';
import { findMarkdowns, generateDataSourceFile } from '../utils';

let watcher: any;

const EVENT_TYPE = {
  ADD: 'add',
  CHANGE: 'change',
  UNLINK: 'unlink',
};

function resolveMdGlob(
  markdown: Record<string, string | string[]>,
  cwd: string,
) {
  return Object.keys(markdown)
    .reduce<string[]>((arr, next) => {
      const v = markdown[next];
      if (typeof v === 'string') {
        arr.push(v);
      } else {
        arr.push(...v);
      }
      return arr;
    }, [])
    .filter(Boolean)
    .map(_ => path.resolve(cwd, _));
}

function initWatcher(
  options: Required<IOptions> & { cwd: string; MDS_MODULE_NAME: string },
) {
  const { cwd, source, MDS_MODULE_NAME } = options;
  // One-liner for current directory
  watcher = chokidar
    .watch(resolveMdGlob(source, cwd), {
      cwd,
      ignored: /node_modules|\.git/,
      ignoreInitial: true,
      atomic: 300,
    })
    .on('all', (event, file) => {
      if (
        [EVENT_TYPE.ADD, EVENT_TYPE.UNLINK].includes(event) &&
        /\.md$/.test(file)
      ) {
        // tslint:disable-next-line: no-console
        console.log('\n[doc - watch] 检测到 md 文件的变更，重新生成文件 ...\n');
        // update datasource file
        generateDataSourceFile({
          source: findMarkdowns({
            cwd,
            source,
          }),
          cwd,
          filename: MDS_MODULE_NAME,
        });
      }
    });
}

process.on('message', payload => {
  const { type, data } = payload;
  if (type === 'INIT_WATCH') {
    initWatcher(data);
  }
});

['SIGINT', 'SIGTERM'].forEach(signal =>
  // @ts-ignore
  process.on(signal, () => {
    /** do your logic */
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    // process.exit();
  }),
);
