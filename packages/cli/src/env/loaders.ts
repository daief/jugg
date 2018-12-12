import Config from 'webpack-chain';
import { getAbsolutePath } from '../utils';

export default (config: Config) => {
  const isProd = process.env.NODE_ENV === 'production';

  config.module
    // --------------- url-loader
    .rule('url-loader')
    .test(/\.(gif|png|jpe?g|svg)$/i)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: 8192,
      name: 'static/[name].[hash:8].[ext]',
    });

  config.module
    // --------------- ts-loader
    .rule('ts-loader')
    .test(/\.tsx?$/)
    .use('ts-loader')
    .loader(require.resolve('ts-loader'))
    .options({
      transpileOnly: true,
      happyPackMode: true,
    });

  config.plugin('fork-ts-checker-webpack-plugin').use(require('fork-ts-checker-webpack-plugin'), [
    {
      tsconfig: getAbsolutePath('tsconfig.json'),
      checkSyntacticErrors: true,
      formatter: 'codeframe',
    },
  ]);

  // XXX
  // config
  //   .module
  //   // --------------- file-loader
  //   .rule('file-loader')
  //   .test(/\.(csv)$/i)
  //   .use('file-loader')
  //   .loader(require.resolve('file-loader'));

  if (isProd) {
    config.module
      // --------------- image-webpack-loader
      .rule('image-webpack-loader')
      .test(/\.(gif|png|jpe?g|svg)$/i)
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
        webp: {
          quality: 75,
        },
      });
  }

  // --------------- set style
  setStyleLoaders(config);
};

function setStyleLoaders(config: Config) {
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
    }
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
    rule.use('extract-css-loader').loader(require('mini-css-extract-plugin').loader);

    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options({
        ...(isModule ? cssModulesConfig : {}),
      });

    rule
      .use('postcss-loader')
      .loader(require.resolve('postcss-loader'))
      .options({
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('autoprefixer')({
            browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
            flexbox: 'no-2009',
          }),
        ],
      });

    if (less === true) {
      rule
        .use('less-loader')
        .loader(require.resolve('less-loader'))
        .options({
          javascriptEnabled: true,
        });
    }
  }

  setCssLoaders(
    config.module
      .rule('css.module')
      .test(/\.module\.(le|c)ss$/i)
      .exclude.add(path => /node_modules/i.test(path))
      .end(),
    {
      isModule: true,
      less: true,
    }
  );

  setCssLoaders(
    config.module
      .rule('css')
      .test(/\.(le|c)ss$/i)
      .exclude.add(cssExclude)
      .end(),
    {
      isModule: false,
      less: true,
    }
  );

  setCssLoaders(
    config.module
      .rule('css-in-node_modules')
      .test(/\.(le|c)ss$/i)
      .include.add(/node_modules/)
      .end(),
    {
      isModule: false,
      less: true,
    }
  );
}
