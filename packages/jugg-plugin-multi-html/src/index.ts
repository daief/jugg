import { Plugin } from '@axew/jugg';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import nodePath from 'path';
import fs from 'fs';

export interface Option {
  // basic html plugin opts
  html?: { [k: string]: any };
  routes?: Array<{
    path: string;
    template?: string;
    // special html plugin opts
    html?: { [k: string]: any };
  }>;
}

const NAME = 'jugg-plugin-multi-html';

const p: Plugin = (api, opts: Option) => {
  const { routes, html: basicHtml } = opts;

  api.chainWebpack(({ config }) => {
    const { IsProd, context, Utils, JConfig } = api.jugg;
    const { logger } = Utils;

    if (!IsProd) {
      return;
    }

    (routes || []).forEach((route, index) => {
      const { path, template = '', html: specialHtml } = route;

      // allow override root path, give a info
      if (path === '/') {
        // return;
        logger.log('');
        logger.warn(`${JConfig.outputDir || 'dist'}/index.html will be overrided by \`${NAME}\``);
        logger.log('');
      }

      const tpl = nodePath.join(context, 'src', template);
      const defaultTpl = nodePath.join(context, 'src', 'document.ejs');
      const builtInTpl = nodePath.join(__dirname, 'document.ejs');

      let targetTpl = '';
      if (template && fs.existsSync(tpl)) {
        targetTpl = tpl;
      } else if (fs.existsSync(defaultTpl)) {
        targetTpl = defaultTpl;
      } else {
        targetTpl = builtInTpl;
      }

      const relativePath = path.replace(/^\//, '').replace(/\/$/, '');

      config
        .plugin(`html-webpack-plugin-multi-html-${index}`)
        .use(HtmlWebpackPlugin, [
          {
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
            inject: true,
            ...basicHtml,
            ...specialHtml,
            filename: `${relativePath ? relativePath + '/' : ''}index.html`,
            template: targetTpl,
          },
        ])
        .end();
    });
  });
};

export default p;
