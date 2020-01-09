const marked = require('marked');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const fm = require('front-matter');
const prism = require('prismjs');
const utils = require('loader-utils');

if (!!process.env.JUGG_PLUGIN_DOC_IN_TEST) {
  // 测试的时候，手动 require 必要的模块
  require('prismjs/components/prism-markup');
  require('prismjs/components/prism-css');
  require('prismjs/components/prism-javascript');
  require('prismjs/components/prism-clike');
  require('prismjs/components/prism-jsx');
  require('prismjs/components/prism-typescript');
  require('prismjs/components/prism-tsx');
} else {
  // 实际使用 load all
  // loadLanguages、jest 一起使用时有问题
  const loadLanguages = require('prismjs/components/index');
  loadLanguages();
}

const scriptLngList = [
  'js',
  'jsx',
  'javascript',
  'ts',
  'tsx',
  'typescript',
].map(_ => new RegExp(`language-${_}`, 'i'));

const escapeHtml = (str: string) =>
  str.replace(
    /[&<>'"]/g,
    tag =>
      (({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        // tslint:disable-next-line: quotemark
        "'": '&#39;',
        '"': '&quot;',
      } as any)[tag] || tag),
  );

function loader(source: string) {
  this.cacheable && this.cacheable();

  // 缓存地址
  const BASE_PATH = path.resolve(this.rootContext, '.cache/jugg-md-loader');
  mkdirp.sync(BASE_PATH);

  // 根据文件内容生成文件全路径
  const genFilePath = (fileContent: string, suffix = '') =>
    path.resolve(
      BASE_PATH,
      utils.interpolateName(this, `[hash].${suffix.toLowerCase()}`, {
        content: fileContent,
      }),
    );

  // 解析出 markdown 的 metadata 和 body
  const { attributes: metadata, body: markdownBody } = fm(source);

  if (!metadata.title) {
    // 使用文件名设置成 title
    metadata.title = path.basename(this.resourcePath).replace(/\.[^\.]+$/, '');
  }

  const renderer = new marked.Renderer();
  // Override function
  // 添加锚点
  renderer.heading = (text: string, level: string) => {
    const anchorText = `${text}`;
    return `<h${level} id="${anchorText}">${anchorText}<a name="${anchorText}" class="anchor" href="#${anchorText}"></a></h${level}>`;
  };

  // 代码块添加高亮
  renderer.code = (sourceCode: string, language: string) => {
    const codeResult =
      prism.languages[language] && sourceCode
        ? prism.highlight(sourceCode, prism.languages[language])
        : escapeHtml(sourceCode);
    return `<pre class="language-${language}"><code>${codeResult}</code></pre>`;
  };

  /**
   * 以 `<!-- more -->` 分成两部分
   * 第一部分会进行代码解析并运行，
   * 之后的原样以 markdown 格式输出
   */
  const [codeBlocks, ...restHtmlArray] = marked(markdownBody, {
    renderer,
  }).split('<!-- more -->');

  const restHtmlString = restHtmlArray.join('');
  let extraHtml = restHtmlString;

  const $ = cheerio.load(codeBlocks);
  const codes = parseCodeList($, { genFilePath });

  // 如果可执行代码块（demo）为空，则全部文件作为 extra 输出
  extraHtml = codes.length === 0 ? codeBlocks + extraHtml : extraHtml;

  return `
    // metadata
    export const metadata = ${JSON.stringify(metadata)};
    // 尝试解析代码块后剩余的 html 部分
    export const extra = ${JSON.stringify(extraHtml)};
    // 整个 markdown 对应的 html，未经处理
    export const html = ${JSON.stringify(codeBlocks + restHtmlString)};
    // 代码块转化成列表作为默认导出
    export default [
      ${codes
        .map(_ => {
          return `{
            title: ${JSON.stringify(_.title)},
            code: ${JSON.stringify(_.code)},
            codeHtml: ${JSON.stringify(_.codeHtml)},
            description: ${JSON.stringify(_.description)},
            demoType: ${JSON.stringify(_.demoType)},
            module: require(${utils.stringifyRequest(this, _.module)}),
          },`;
        })
        .join('')}
    ];
  `;
}

export default loader;

function parseCodeList(
  $: any,
  { genFilePath }: any,
): Array<{
  /**
   * 代码块 title
   */
  title: string;
  /**
   * 代码块描述
   */
  description: string;
  /**
   * 代码块内容
   */
  code: string;
  /**
   * 代码块 html 字符串，含高亮（如果有的话）
   */
  codeHtml: string;
  /**
   * 代码块对应的文件
   */
  module: string;
  /**
   * demo 类型
   */
  demoType: 'TSX' | 'VUE';
}> {
  return $('h2')
    .map(function() {
      const $title = $(this);
      const $nexts = $title.nextUntil('pre');
      const $code = ($nexts.length ? $nexts : $title).next('pre');

      // 未找到代码块
      if (!$code.length) {
        return null;
      }

      // 第一块不是脚本则直接忽略
      if (!scriptLngList.some(_ => _.test($code.attr('class')))) {
        return null;
      }

      // ! 要相连
      // 第二个代码块
      const $secondCode = $code.next('pre');

      let demoType = 'TSX';
      let code = $code.text();
      let codeHtml = $.html($code);

      // 第二块要是 html，则组合成 vue
      if ($secondCode.length && /html/i.test($secondCode.attr('class'))) {
        demoType = 'VUE';

        code = `<script lang="ts">
${code}
</script>
${$secondCode.text()}`;

        codeHtml = `<pre class="language-html"><code>${prism.highlight(
          code,
          prism.languages.html,
        )}</code></pre>`;
      }

      return {
        title: ($title.text() || '').trim(),
        description: $nexts
          .map(function() {
            // return $(this).text();
            return $.html($(this));
          })
          .get()
          .filter(Boolean)
          .reduce((pre: string, next: string) => pre + next, ''),
        // code: $code.text(),
        // codeHtml: $.html($code),
        code,
        codeHtml,
        demoType,
      };
    })
    .get()
    .filter(Boolean)
    .map(({ title, code, demoType, ...rest }: any) => {
      const codeFile = genFilePath(code, demoType);
      fs.writeFileSync(codeFile, code);
      return {
        ...rest,
        title,
        code,
        demoType,
        module: codeFile,
      };
    });
}
