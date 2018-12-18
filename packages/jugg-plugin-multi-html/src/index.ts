import { Plugin } from '@axew/jugg';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import nodePath from 'path';
import fs from 'fs';

export interface Option {
  routes?: Array<{
    path: string;
    template?: string;
  }>;
}

const p: Plugin = (api, opts: Option) => {
  const { routes } = opts;

  api.chainWebpack(({ config }) => {
    const { IsProd } = api.jugg;

    if (!IsProd) {
      return;
    }

    (routes || []).forEach((route, index) => {
      const { path, template = '' } = route;

      // root path
      if (path === '/') {
        return;
      }

      const tpl = nodePath.join(process.cwd(), 'src', template);
      const defaultTpl = nodePath.join(process.cwd(), 'src', 'document.ejs');
      const builtInTpl = nodePath.join(__dirname, 'document.ejs');

      config
        .plugin(`html-webpack-plugin-multi-html-${index}`)
        .use(HtmlWebpackPlugin, [
          {
            filename: `${path.replace(/^\//, '')}/index.html`,
            template:
              template && fs.existsSync(tpl)
                ? tpl
                : fs.existsSync(defaultTpl)
                ? defaultTpl
                : builtInTpl,
            inject: true,
            minify: {
              caseSensitive: true,
              collapseWhitespace: true,
              conservativeCollapse: true,
              removeAttributeQuotes: false,
              removeComments: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              minifyCSS: true,
              minifyJS: true,
              minifyURLs: true,
            },
          },
        ])
        .end();
    });
  });
};

export default p;
