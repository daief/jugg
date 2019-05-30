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
   * set source code dir, default contains `src`
   */
  sourceDir?: string | string[];
}

export default (opts: IOptions, api: PluginAPI) => {
  const {
    convertLessImport2Css = true,
    copyFileSuffix = '',
    sourceDir = '',
  } = opts;

  const getSourceDirArray = (extensions: string): string[] =>
    ['src', ...(Array.isArray(sourceDir) ? [...sourceDir] : [sourceDir])]
      .filter((dir, idx, self) => !!dir && self.indexOf(dir) === idx)
      .map(dir => `${dir}/**/*.${extensions}`);

  const appendSuffix = copyFileSuffix.replace(/^\|*/, '').replace(/\|*$/, '');

  const { getAbsolutePath, logger } = api.jugg.Utils;
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
      .src(getSourceDirArray('less'))
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
        getSourceDirArray(
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
          before: [transformerFactory()],
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
    const tsResult = compileTS(getSourceDirArray('@(ts|tsx)'), {
      allowJs: false,
      declaration: true,
    });

    // use tsc compile js, jsx, no declaration files
    const tsJsResult = compileTS(getSourceDirArray('@(js|jsx)'), {
      allowJs: true,
      declaration: false,
      // isolatedModules (boolean) - Compiles files seperately and doesn't check types,
      // which causes a big speed increase. You have to use gulp-plumber and TypeScript 1.5+.
      isolatedModules: true,
    });

    const vueResult = gulp
      .src(getSourceDirArray('vue'))
      .pipe(filterTest())
      .pipe(gulpVue())
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
    logger.info('[Parallel] Compile to es...');
    return compile(false);
  });

  gulp.task('compile-with-lib', () => {
    logger.info('[Parallel] Compile to js...');
    return compile(true);
  });

  gulp.task('compile', gulp.parallel('compile-with-es', 'compile-with-lib'));

  return gulp;
};
