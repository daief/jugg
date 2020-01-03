import * as fs from 'fs';
import * as glob from 'glob';
import flatten from 'lodash/flatten';
import * as path from 'path';
import { IOptions, ISourceSchema } from './interface';

/**
 * 解析需要加载的 markdown
 * 返回数据形如：
 * ```js
 * {
 *    doc: ['path/a/f.md', 'path/b/f.md'],
 *    doc2: ['path/c/f.md', 'path/d/f.md'],
 * }
 * ```
 * @param
 *  - cwd: 上下文路径
 *  - source: 取自配置文件的 `markdown` 项
 * @return {Record<string, string[]>}
 */
export function findMarkdowns(opts: {
  cwd: string;
  source: Record<string, ISourceSchema>;
}): Record<string, string[]> {
  const { cwd, source } = opts;
  const findFiles = (_: string) =>
    glob.sync(path.resolve(cwd, _), { ignore: '**/node_modules/**' });

  return Object.keys(source).reduce<any>((result, nextKey) => {
    let pathArray = source[nextKey];
    pathArray = Array.isArray(pathArray) ? pathArray : [];
    result[nextKey] = [...new Set(flatten(pathArray.map(findFiles)))];
    return result;
  }, {});
}

const TEMPLATE = `
/* 该文件自动生成，作为 md 文件的数据源以供项目中使用 */
import flatten from 'lodash/flatten';
import { mountReactGlobal } from './theme/template/utils';

mountReactGlobal();

const mds: Record<string, any> = {<% PLACEHOLDER %>};

function getPageMap() {
  const map = new Map<string, any>(
    flatten(
      Object.keys(mds).map(category => {
        const item = mds[category];
        return Object.keys(item).map(itemK => {
          const md = item[itemK];
          const { metadata } = md;
          const { route } = metadata;
          md.category = category;
          return ['/' + encodeURIComponent(category) + '/' + encodeURIComponent(route || itemK), md];
        });
      }),
    ),
  );
  return map;
}

export default mds;
export const pageMap = getPageMap();
`;

/**
 * 动态生成 mds 文件，使得项目里能够通过 require('site/mds') 引用到
 * 使用这种方式，是因为当前没能做到，在代码中根据 edocrc 中的配置引用到 md 文件
 * @param
 *  - source: 解析后的 markdown 路径集合
 *  - cwd: 上下文
 *  - filename: 文件名
 */
export function generateDataSourceFile({
  source,
  cwd,
  filename,
}: {
  source: Record<string, string[]>;
  cwd: string;
  filename: string;
}) {
  const placeholder = /<% PLACEHOLDER %>/g;
  try {
    const resolveMds = (pathArray: string[]) => {
      const result = pathArray.reduce((pre, next) => {
        pre += `${JSON.stringify(
          path.relative(cwd, next),
        )}: require(${JSON.stringify(next)}),\n`;
        return pre;
      }, '');
      return `{\n${result || ''}\n},`;
    };

    fs.writeFileSync(
      filename,
      TEMPLATE.replace(
        placeholder,
        Object.keys(source).reduce((pre, next) => {
          pre += `${JSON.stringify(next)}:` + resolveMds(source[next]) + '\n';
          return pre;
        }, ''),
      ),
    );
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.error('[doc] 动态生成文件失败！', error);
    process.exit(1);
  }
}

export function guardOptions(opts: IOptions): Required<IOptions> {
  const { source } = opts;
  return {
    source: {
      ...source,
    },
  };
}
