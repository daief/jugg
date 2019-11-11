/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-08-15 23:37:21
 * @Description:
 */
import { TYPES } from '@axew/jugg';
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import gulp from 'gulp';
import gulpTs from 'gulp-typescript';
import merge2 from 'merge2';
import rimraf from 'rimraf';
import through2 from 'through2';
import filterTest from './filterTest';
import gulpVue from './gulpVue';
import transformLess from './transformLess';
import transformerFactory from './tsConvertImportFrom';

export interface IOptions {
  /**
   * convert less import in es/lib to css file path, default `true`
   */
  convertLessImport2Css?: boolean;
  /**
   * copy file to dest with this suffix, built-in `png|jpg|jpeg|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf|otf`
   * @example `md|html`
   */
  copyFileSuffix?: string;
  /**
   * set source code dir
   * @default `src`
   */
  sourceDir?: string | string[];
  /**
   * 插件的 `tsCustomTransformers`
   */
  tsCustomTransformers?: (
    opts: {
      /**
       * 是否构建 ES Module
       */
      isEsModule: boolean;
    },
  ) => {
    before?: TYPES.PluginCfgSchema[];
    after?: TYPES.PluginCfgSchema[];
  };
}

export default (opts: IOptions, api: PluginAPI) => {
  const {
    convertLessImport2Css = true,
    copyFileSuffix = '',
    sourceDir = '',
    tsCustomTransformers,
  } = opts;

  const getSourceDirArray = (): string[] => {
    const arr = (Array.isArray(sourceDir)
      ? [...sourceDir]
      : [sourceDir]
    ).filter((dir, idx, self) => !!dir && self.indexOf(dir) === idx);
    if (arr.length) {
      return arr;
    }
    return ['src'];
  };

  const SOURCE_DIR_ARR = getSourceDirArray();

  const getSourceFilesArray = (extensions: string): string[] =>
    // ['src', ...(Array.isArray(sourceDir) ? [...sourceDir] : [sourceDir])]
    SOURCE_DIR_ARR.map(dir => `${dir}/**/*.${extensions}`);

  const appendSuffix = copyFileSuffix.replace(/^\|*/, '').replace(/\|*$/, '');

  const { getAbsolutePath, logger, resolvePlugin } = api.jugg.Utils;
  const LIB_DIR = getAbsolutePath('lib');
  const ES_DIR = getAbsolutePath('es');

  async function compile(isEsModule: boolean) {
    const TARGET_DIR = isEsModule ? ES_DIR : LIB_DIR;
    const errors: any[] = [];
    // rm output dir
    await new Promise(resolve => {
      rimraf(TARGET_DIR, (err: any) => {
        if (!err) {
          logger.info(`Before start removed: ${TARGET_DIR}`);
        }
        resolve();
      });
    });

    const less = gulp
      .src(getSourceFilesArray('less'))
      .pipe(filterTest())
      .pipe(
        through2.obj(function(file, _2, next) {
          this.push(file.clone());

          transformLess(file.path)
            .then(css => {
              file.contents = Buffer.from(css);
              file.path = file.path.replace(/\.less$/, '.css');
              this.push(file);
              next();
            })
            .catch(errors.push);
        }),
      );

    // copy files
    const assets = gulp
      .src(
        getSourceFilesArray(
          `@(png|jpg|jpeg|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf|otf${
            appendSuffix ? '|' + appendSuffix : ''
          })`,
        ),
      )
      .pipe(filterTest());

    // const compileTS = (src?: string[], tsOpts: any = {}) => {
    //   // 读取配置
    //   const { before = [], after = [] } = tsCustomTransformers
    //     ? tsCustomTransformers({ isEsModule })
    //     : api.jugg.JConfig.tsCustomTransformers!;

    //   const TS_CONFIG_FILE = getAbsolutePath(
    //     process.env.JUGG_TS_PROJECT || 'tsconfig.json',
    //   );

    //   const tsProject = gulpTs.createProject(TS_CONFIG_FILE, {
    //     noUnusedParameters: true,
    //     noUnusedLocals: true,
    //     strictNullChecks: true,
    //     allowSyntheticDefaultImports: true,
    //     target: 'es5',
    //     moduleResolution: 'node',
    //     module: isEsModule ? 'esnext' : 'commonjs',
    //     ...tsOpts,
    //     getCustomTransformers: () => ({
    //       before: [transformerFactory(), ...before.map(resolvePlugin)],
    //       after: after.map(resolvePlugin),
    //     }),
    //   });

    //   if (src) {
    //     const rs = gulp
    //       .src(src)
    //       .pipe(filterTest())
    //       .pipe(tsProject(gulpTs.reporter.fullReporter(true)))
    //       // https://github.com/ivogabe/gulp-typescript/issues/295
    //       .on('error', errors.push);

    //     return rs;
    //   }

    //   return through2
    //     .obj((file, _, next) => {
    //       next(null, file);
    //     })
    //     .pipe(tsProject(gulpTs.reporter.fullReporter(true)))
    //     .on('error', errors.push);
    // };

    const convertLessImport2CssStream = () =>
      through2.obj(function z(file, encoding, next) {
        this.push(file.clone());
        if (
          file.path.match(/(\/|\\)style(\/|\\)index\.js/) &&
          convertLessImport2Css === true
        ) {
          const content = file.contents.toString(encoding);
          const cssInjection = (c: string) =>
            c
              .replace(/\/style\/?'/g, `/style/css'`)
              .replace(/\/style\/?"/g, `/style/css"`)
              .replace(/\.less/g, '.css');

          file.contents = Buffer.from(cssInjection(content));
          file.path = file.path.replace(/index\.js/, 'css.js');
          this.push(file);
          next();
        } else {
          next();
        }
      });

    const compileTSPipe = (
      tsOpts: any = {},
      /**
       * 是否使用 transformer
       */
      withTransformer = true,
    ) => {
      // 读取配置
      const { before = [], after = [] } = tsCustomTransformers
        ? tsCustomTransformers({ isEsModule })
        : api.jugg.JConfig.tsCustomTransformers!;

      const TS_CONFIG_FILE = getAbsolutePath(
        process.env.JUGG_TS_PROJECT || 'tsconfig.json',
      );

      const tsProject = gulpTs.createProject(TS_CONFIG_FILE, {
        noUnusedParameters: true,
        noUnusedLocals: true,
        strictNullChecks: true,
        allowSyntheticDefaultImports: true,
        target: 'es5',
        moduleResolution: 'node',
        module: isEsModule ? 'esnext' : 'commonjs',
        ...tsOpts,
        getCustomTransformers: () =>
          withTransformer
            ? {
                before: [transformerFactory(), ...before.map(resolvePlugin)],
                after: after.map(resolvePlugin),
              }
            : {
                before: [],
                after: [],
              },
      });

      return through2
        .obj((file, _, next) => {
          next(null, file);
        })
        .pipe(tsProject(gulpTs.reporter.fullReporter(true)))
        .on('error', errors.push);
    };

    let codeSourcePipeline: any;
    if (isEsModule) {
      // 处理 es 情况下编译
      const tsResult = gulp.src(getSourceFilesArray('@(ts|tsx)')).pipe(
        compileTSPipe({
          allowJs: false,
          declaration: true,
        }),
      );
      const jsResult = gulp.src(getSourceFilesArray('@(js|jsx)')).pipe(
        compileTSPipe({
          allowJs: true,
          declaration: false,
        }),
      );
      const vueResult = gulp
        .src(getSourceFilesArray('vue'))
        .pipe(filterTest())
        .pipe(gulpVue(api))
        .pipe(
          compileTSPipe({
            allowJs: true,
            declaration: false,
            isolatedModules: true,
          }),
        );
      codeSourcePipeline = merge2([
        tsResult.js.pipe(convertLessImport2CssStream()),
        tsResult.dts,
        jsResult.js.pipe(convertLessImport2CssStream()),
        vueResult.js,
      ]);
    } else {
      // lib 下，先使用 es module 编译，不然 ts-import-plugin 会有问题
      // 再将 es module => commonjs
      const tsResult = gulp.src(getSourceFilesArray('@(ts|tsx)')).pipe(
        compileTSPipe({
          allowJs: false,
          declaration: true,
          module: 'esnext',
        }),
      );
      const tsJsResult = tsResult.js.pipe(
        compileTSPipe(
          {
            allowJs: true,
            declaration: false,
          },
          false,
        ),
      );
      const jsResult = gulp
        .src(getSourceFilesArray('@(js|jsx)'))
        .pipe(
          compileTSPipe({
            allowJs: true,
            declaration: false,
            module: 'esnext',
          }),
        )
        .js.pipe(
          compileTSPipe(
            {
              allowJs: true,
              declaration: false,
            },
            false,
          ),
        );
      const vueResult = gulp
        .src(getSourceFilesArray('vue'))
        .pipe(filterTest())
        .pipe(gulpVue(api))
        .pipe(
          compileTSPipe({
            allowJs: true,
            declaration: false,
            isolatedModules: true,
            module: 'esnext',
          }),
        )
        .js.pipe(
          compileTSPipe(
            {
              allowJs: true,
              declaration: false,
            },
            false,
          ),
        );
      codeSourcePipeline = merge2([
        tsJsResult.js.pipe(convertLessImport2CssStream()),
        tsResult.dts,
        jsResult.js.pipe(convertLessImport2CssStream()),
        vueResult.js,
      ]);
    }

    // // use tsc compile ts, tsx, with declaration files
    // const tsResult = compileTS(getSourceFilesArray('@(ts|tsx)'), {
    //   allowJs: false,
    //   declaration: true,
    // });

    // // use tsc compile js, jsx, no declaration files
    // const tsJsResult = compileTS(getSourceFilesArray('@(js|jsx)'), {
    //   allowJs: true,
    //   declaration: false,
    //   // isolatedModules (boolean) - Compiles files seperately and doesn't check types,
    //   // which causes a big speed increase. You have to use gulp-plumber and TypeScript 1.5+.
    //   isolatedModules: true,
    // });

    // const vueResult = gulp
    //   .src(getSourceFilesArray('vue'))
    //   .pipe(filterTest())
    //   .pipe(gulpVue(api))
    //   .pipe(
    //     compileTS(void 0, {
    //       allowJs: true,
    //       declaration: false,
    //       isolatedModules: true,
    //     }),
    //   )
    //   .js.pipe(gulp.dest(TARGET_DIR));

    return new Promise((resolve, reject) => {
      merge2([
        less.pipe(gulp.dest(TARGET_DIR)),
        assets.pipe(gulp.dest(TARGET_DIR)),
        codeSourcePipeline.pipe(gulp.dest(TARGET_DIR)),
        // tsResult.js
        //   .pipe(convertLessImport2CssStream())
        //   .pipe(gulp.dest(TARGET_DIR)),
        // tsResult.dts.pipe(gulp.dest(TARGET_DIR)),
        // tsJsResult.js
        //   .pipe(convertLessImport2CssStream())
        //   .pipe(gulp.dest(TARGET_DIR)),
        // vueResult,
      ]).on('finish', () => {
        if (errors.length) {
          return reject(errors);
        }
        resolve();
      });
    });
  }

  gulp.task('compile-with-es', () => {
    logger.info('Compile to es...', '[Parallel]');
    return compile(true);
  });

  gulp.task('compile-with-lib', () => {
    logger.info('Compile to lib...', '[Parallel]');
    return compile(false);
  });

  gulp.task('compile', gulp.parallel('compile-with-es', 'compile-with-lib'));

  gulp.task('watch-to-lib', () => {
    logger.info(
      `Now start watching: [${SOURCE_DIR_ARR.join(', ')}]`,
      '[Watch]',
    );
    gulp.watch(
      SOURCE_DIR_ARR.map(_ => `${_}/**/*`),
      gulp.series('compile-with-lib'),
    );
  });

  gulp.task('watch-to-es', () => {
    gulp.watch(
      SOURCE_DIR_ARR.map(_ => `${_}/**/*`),
      gulp.series('compile-with-es'),
    );
  });

  gulp.task('watch', gulp.parallel('watch-to-lib', 'watch-to-es'));

  return gulp;
};
