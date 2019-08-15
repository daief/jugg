/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-08-15 23:37:21
 * @Description:
 */
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
}

export default (opts: IOptions, api: PluginAPI) => {
  const {
    convertLessImport2Css = true,
    copyFileSuffix = '',
    sourceDir = '',
  } = opts;

  const { before = [], after = [] } = api.jugg.JConfig.tsCustomTransformers!;

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

  async function compile(modules: boolean) {
    const TARGET_DIR = modules === false ? ES_DIR : LIB_DIR;
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
            .catch(e => {
              logger.error(e);
            });
        }),
      )
      .pipe(gulp.dest(TARGET_DIR));

    // copy files
    const assets = gulp
      .src(
        getSourceFilesArray(
          `@(png|jpg|jpeg|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf|otf${
            appendSuffix ? '|' + appendSuffix : ''
          })`,
        ),
      )
      .pipe(filterTest())
      .pipe(gulp.dest(TARGET_DIR));

    const compileTS = (src?: string[], tsOpts: any = {}) => {
      const tsProject = gulpTs.createProject(getAbsolutePath('tsconfig.json'), {
        noUnusedParameters: true,
        noUnusedLocals: true,
        strictNullChecks: true,
        allowSyntheticDefaultImports: true,
        target: 'es5',
        moduleResolution: 'node',
        module: modules ? 'commonjs' : 'esnext',
        ...tsOpts,
        getCustomTransformers: () => ({
          before: [transformerFactory(), ...before.map(resolvePlugin)],
          after: after.map(resolvePlugin),
        }),
      });

      if (src) {
        const rs = gulp
          .src(src)
          .pipe(filterTest())
          .pipe(tsProject(gulpTs.reporter.fullReporter(true)));

        return rs;
      }

      return through2
        .obj((file, _, next) => {
          next(null, file);
        })
        .pipe(tsProject(gulpTs.reporter.fullReporter(true)));
    };

    // use tsc compile ts, tsx, with declaration files
    const tsResult = compileTS(getSourceFilesArray('@(ts|tsx)'), {
      allowJs: false,
      declaration: true,
    });

    // use tsc compile js, jsx, no declaration files
    const tsJsResult = compileTS(getSourceFilesArray('@(js|jsx)'), {
      allowJs: true,
      declaration: false,
      // isolatedModules (boolean) - Compiles files seperately and doesn't check types,
      // which causes a big speed increase. You have to use gulp-plumber and TypeScript 1.5+.
      isolatedModules: true,
    });

    const vueResult = gulp
      .src(getSourceFilesArray('vue'))
      .pipe(filterTest())
      .pipe(gulpVue(api))
      .pipe(
        compileTS(undefined, {
          allowJs: true,
          declaration: false,
          isolatedModules: true,
        }),
      )
      .js.pipe(gulp.dest(TARGET_DIR));

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

    return new Promise(resolve => {
      merge2([
        less,
        tsResult.js
          .pipe(convertLessImport2CssStream())
          .pipe(gulp.dest(TARGET_DIR)),
        tsResult.dts.pipe(gulp.dest(TARGET_DIR)),
        tsJsResult.js
          .pipe(convertLessImport2CssStream())
          .pipe(gulp.dest(TARGET_DIR)),
        assets,
        vueResult,
      ]).on('finish', () => {
        resolve();
      });
    });
  }

  gulp.task('compile-with-es', () => {
    logger.info('Compile to es...', '[Parallel]');
    return compile(false);
  });

  gulp.task('compile-with-lib', () => {
    logger.info('Compile to lib...', '[Parallel]');
    return compile(true);
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
