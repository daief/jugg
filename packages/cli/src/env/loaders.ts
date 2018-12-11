import Config from 'webpack-chain';

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
  // TODO refine here & else about
  const isProd = process.env.NODE_ENV === 'production';

  const cssModulesConfig = {
    modules: true,
    localIdentName: '[local]___[hash:base64:5]',
  };

  // --------------- support css & less
  const cssRule = config.module.rule('css').test(/\.(le|c)ss$/i);
  if (!isProd) {
    cssRule.use('css-hot-loader').loader(require.resolve('css-hot-loader'));
  }

  // remember to add plugin
  cssRule.use('extract-css-loader').loader(require('mini-css-extract-plugin').loader);

  cssRule
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options({
      ...cssModulesConfig,
    });

  cssRule
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

  cssRule
    .use('less-loader')
    .loader(require.resolve('less-loader'))
    .options({
      javascriptEnabled: true,
      ...cssModulesConfig,
    });
}
