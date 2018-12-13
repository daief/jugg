import { Plugin, Jugg } from '@axew/jugg';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import nodePath from 'path';
import fs from 'fs';

export interface Option {
  routes?: Array<{
    path: string;
    template?: string;
  }>;
}

const p: Plugin = (jugg: Jugg, opts: Option) => {
  const { routes } = opts;
  const { IsProd, Utils } = jugg;
  const { getAbsolutePath } = Utils;

  return ({ config }) => {
    if (IsProd) {
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
              filename: getAbsolutePath('dist', path, 'index.html'),
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
    }
  };
};

export default p;
