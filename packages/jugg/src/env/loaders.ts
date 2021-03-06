import { existsSync, lstatSync } from 'fs';
import Config from 'webpack-chain';
import { Jugg } from '..';
import { matchTranspileDependencies } from '../utils/matchTranspileDependencies';
import { Plugin, Rule } from './chainCfgMap';

export default (config: Config, jugg: Jugg) => {
  const isProd = jugg.IsProd;
  const { tsCustomTransformers, transpileDependencies } = jugg.JConfig;
  const { getAbsolutePath, resolvePlugin } = jugg.Utils;

  const genUrlLoaderOptions = () => {
    return {
      limit: 4096,
      // use explicit fallback to avoid regression in url-loader>=1.1.0
      fallback: {
        loader: 'file-loader',
        options: {
          name: 'static/[name].[hash:8].[ext]',
        },
      },
    };
  };

  config.module
    // --------------- images url-loader
    .rule(Rule.IMAGES_RULE)
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options(genUrlLoaderOptions());

  config.module
    // --------------- svg file-loader
    .rule(Rule.SVG_RULE)
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader(require.resolve('file-loader'))
    .options({
      name: 'static/[name].[hash:8].[ext]',
    });

  config.module
    // --------------- media url-loader
    .rule(Rule.MEDIA_RULE)
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options(genUrlLoaderOptions());

  config.module
    // --------------- fonts url-loader
    .rule(Rule.FONTS_RULE)
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader('url-loader')
    .options(genUrlLoaderOptions());

  // TODO 考虑抽离 TS 部分
  // ts project
  const TS_CONFIG_FILE = getAbsolutePath(
    process.env.JUGG_TS_PROJECT || 'tsconfig.json',
  );
  if (existsSync(TS_CONFIG_FILE) && lstatSync(TS_CONFIG_FILE).isFile()) {
    const { before = [], after = [] } = tsCustomTransformers;
    const beforeTransformers = before.map(resolvePlugin);
    const afterTransformers = after.map(resolvePlugin);

    const tsOpts = {
      transpileOnly: true,
      happyPackMode: true,
      configFile: TS_CONFIG_FILE,
      getCustomTransformers: () => ({
        before: beforeTransformers,
        after: afterTransformers,
      }),
    };

    const setTsLoader = (param: { rule: Rule; test: RegExp }) => {
      const { rule, test } = param;
      config.module
        .rule(rule)
        .test(test)
        .exclude.add((path: string) => {
          if (matchTranspileDependencies(transpileDependencies, path)) {
            return false;
          }
          return /node_modules/.test(path);
        })
        .end()
        .use('ts-loader')
        .loader(require.resolve('ts-loader'))
        .options(tsOpts);
    };

    // --------------- ts-loader, tx
    setTsLoader({
      rule: Rule.TS_RULE,
      test: /\.ts$/,
    });

    // --------------- ts-loader, txx
    setTsLoader({
      rule: Rule.TSX_RULE,
      test: /\.tsx$/,
    });

    // --------------- ts-loader, js
    setTsLoader({
      rule: Rule.JS_RULE,
      test: /\.js$/,
    });

    // --------------- ts-loader, jsx
    setTsLoader({
      rule: Rule.JSX_RULE,
      test: /\.jsx$/,
    });

    if (process.env.FORK_TS_CHECKER !== 'none') {
      config
        .plugin(Plugin.FORK_TS_CHECKER_PLUGIN)
        .use(require('fork-ts-checker-webpack-plugin'), [
          {
            tsconfig: TS_CONFIG_FILE,
            checkSyntacticErrors: true,
            formatter: 'codeframe',
          },
        ]);
    }
  }

  if (isProd) {
    config.module
      // --------------- image-webpack-loader
      .rule(Rule.IMAGES_IMAGE_WEBPACK_LOADER_RULE)
      .test(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/)
      .use('image-webpack-loader')
      .loader(require.resolve('image-webpack-loader'))
      .options({
        mozjpeg: {
          progressive: true,
          quality: 65,
        },
        // optipng.enabled: false will disable optipng
        optipng: {
          enabled: false,
        },
        pngquant: {
          quality: '65-90',
          speed: 4,
        },
        gifsicle: {
          interlaced: false,
        },
        // the webp option will enable WEBP
        // webp: {
        //   quality: 75,
        // },
      });
  }

  // --------------- set style
  setStyleLoaders(config, jugg);
};

function setStyleLoaders(config: Config, jugg: Jugg) {
  const { css } = jugg.JConfig;
  const { postcss } = css.loaderOptions;

  function cssExclude(filePath: string) {
    if (/node_modules/.test(filePath)) {
      return true;
    }

    if (/\.module\.(css|less|sass|scss)$/.test(filePath)) {
      return true;
    }

    return false;
  }

  // TODO refine here & else about
  const isProd = process.env.NODE_ENV === 'production';

  const cssModulesConfig = {
    modules: true,
    localIdentName: '[local]___[hash:base64:5]',
  };

  // --------------- support css & less
  function setCssLoaders(
    rule: Config.Rule,
    opts: {
      isModule?: boolean;
      less?: boolean;
    },
  ) {
    const defaultOpts = {
      isModule: true,
    };
    const { isModule, less } = { ...defaultOpts, ...opts };

    if (!isProd) {
      rule.use('css-hot-loader').loader(require.resolve('css-hot-loader'));
    }

    // notice the order
    // remember to add plugin
    rule
      .use('extract-css-loader')
      .loader(require('mini-css-extract-plugin').loader);

    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options({
        ...(isModule ? cssModulesConfig : {}),
        ...css.loaderOptions.css,
      });

    if (postcss !== false) {
      rule
        .use('postcss-loader')
        .loader(require.resolve('postcss-loader'))
        .options({
          ...postcss,
          plugins:
            Array.isArray(postcss.plugins) || !postcss.plugins
              ? () =>
                  postcss.plugins === false
                    ? []
                    : [
                        require('postcss-flexbugs-fixes'),
                        require('autoprefixer')({
                          flexbox: 'no-2009',
                        }),
                        ...(postcss.plugins || []),
                      ].filter(Boolean)
              : postcss.plugins,
        });
    }

    if (less === true) {
      rule
        .use('less-loader')
        .loader(require.resolve('less-loader'))
        .options({
          javascriptEnabled: true,
          ...css.loaderOptions.less,
        });
    }
  }

  // --------------- css ---------------
  setCssLoaders(
    config.module
      .rule(Rule.CSS_MODULE_RULE)
      .test(/\.module\.css$/i)
      .exclude.add(path => /node_modules/i.test(path))
      .end(),
    {
      isModule: true,
      less: false,
    },
  );

  setCssLoaders(
    config.module
      .rule(Rule.CSS_RULE)
      .test(/\.css$/i)
      .exclude.add(cssExclude)
      .end(),
    {
      isModule: false,
      less: false,
    },
  );

  setCssLoaders(
    config.module
      .rule(Rule.CSS_IN_NODE_MODULES_RULE)
      .test(/\.css$/i)
      .include.add(/node_modules/)
      .end(),
    {
      isModule: false,
      less: false,
    },
  );

  // --------------- less ---------------
  setCssLoaders(
    config.module
      .rule(Rule.LESS_MODULE_RULE)
      .test(/\.module\.less$/i)
      .exclude.add(path => /node_modules/i.test(path))
      .end(),
    {
      isModule: true,
      less: true,
    },
  );

  setCssLoaders(
    config.module
      .rule(Rule.LESS_RULE)
      .test(/\.less$/i)
      .exclude.add(cssExclude)
      .end(),
    {
      isModule: false,
      less: true,
    },
  );

  setCssLoaders(
    config.module
      .rule(Rule.LESS_IN_NODE_MODULES_RULE)
      .test(/\.less$/i)
      .include.add(/node_modules/)
      .end(),
    {
      isModule: false,
      less: true,
    },
  );
}
