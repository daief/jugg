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
};
