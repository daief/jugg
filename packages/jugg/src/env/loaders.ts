import Config from 'webpack-chain';
import { existsSync } from 'fs';
import { getAbsolutePath } from '../utils';

export default (config: Config) => {
  const isProd = process.env.NODE_ENV === 'production';

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
    .rule('images-url-loader')
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options(genUrlLoaderOptions());

  config.module
    // --------------- svg file-loader
    .rule('svg-file-loader')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader(require.resolve('file-loader'))
    .options({
      name: 'static/[name].[hash:8].[ext]',
    });

  config.module
    // --------------- media url-loader
    .rule('media-url-loader')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options(genUrlLoaderOptions());

  config.module
    // --------------- fonts url-loader
    .rule('fonts-url-loader')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader('url-loader')
    .options(genUrlLoaderOptions());

  // TODO 考虑抽离 TS 部分
  // ts project
  if (existsSync(getAbsolutePath('tsconfig.json'))) {
    const tsOpts = {
      transpileOnly: true,
      happyPackMode: true,
    };

    config.module
      // --------------- ts-loader, tx
      .rule('ts-rule')
      .test(/\.ts$/)
      .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .options(tsOpts);

    config.module
      // --------------- ts-loader, txx
      .rule('tsx-rule')
      .test(/\.tsx$/)
      .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .options(tsOpts);

    config.plugin('fork-ts-checker-webpack-plugin').use(require('fork-ts-checker-webpack-plugin'), [
      {
        tsconfig: 'tsconfig.json',
        checkSyntacticErrors: true,
        formatter: 'codeframe',
      },
    ]);
  }

  if (isProd) {
    config.module
      // --------------- image-webpack-loader
      .rule('image-webpack-loader')
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

  // --------------- css ---------------
  setCssLoaders(
    config.module
      .rule('css.module')
      .test(/\.module\.css$/i)
      .exclude.add(path => /node_modules/i.test(path))
      .end(),
    {
      isModule: true,
      less: false,
    }
  );

  setCssLoaders(
    config.module
      .rule('css')
      .test(/\.css$/i)
      .exclude.add(cssExclude)
      .end(),
    {
      isModule: false,
      less: false,
    }
  );

  setCssLoaders(
    config.module
      .rule('css-in-node_modules')
      .test(/\.css$/i)
      .include.add(/node_modules/)
      .end(),
    {
      isModule: false,
      less: false,
    }
  );

  // --------------- less ---------------
  setCssLoaders(
    config.module
      .rule('less.module')
      .test(/\.module\.less$/i)
      .exclude.add(path => /node_modules/i.test(path))
      .end(),
    {
      isModule: true,
      less: true,
    }
  );

  setCssLoaders(
    config.module
      .rule('less')
      .test(/\.less$/i)
      .exclude.add(cssExclude)
      .end(),
    {
      isModule: false,
      less: true,
    }
  );

  setCssLoaders(
    config.module
      .rule('less-in-node_modules')
      .test(/\.less$/i)
      .include.add(/node_modules/)
      .end(),
    {
      isModule: false,
      less: true,
    }
  );
}
