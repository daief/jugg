import gulp from 'gulp';
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import through2 from 'through2';
import transformLess from './transformLess';
import gulpTs from 'gulp-typescript';
import merge2 from 'merge2';
import gulpVue from './gulpVue';
import { ScriptTarget, ModuleResolutionKind, ModuleKind } from 'typescript';
import transformerFactory from './tsConvertImportFrom';
import rimraf from 'rimraf';
import filterTest from './filterTest';

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

  async function compile(modules: boolean, callback: () => void) {
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

    const BASE_COMPILER_OPTIONS_FN = (isGulpTs = true): any => {
      const COMMON_CFG = {
        noUnusedParameters: true,
        noUnusedLocals: true,
        strictNullChecks: true,
        allowSyntheticDefaultImports: true,
      };
      return isGulpTs === true
        ? {
            ...COMMON_CFG,
            target: 'es5',
            moduleResolution: 'node',
            module: modules ? 'commonjs' : 'esnext',
          }
        : {
            ...COMMON_CFG,
            target: ScriptTarget.ES5,
            moduleResolution: ModuleResolutionKind.NodeJs,
            module: modules ? ModuleKind.CommonJS : ModuleKind.ESNext,
          };
    };

    const compileTS = (src: string[], tsOpts: any = {}) => {
      const tsProject = gulpTs.createProject(getAbsolutePath('tsconfig.json'), {
        ...BASE_COMPILER_OPTIONS_FN(),
        ...tsOpts,
        getCustomTransformers: () => ({
          before: [transformerFactory()],
        }),
      });

      const rs = gulp
        .src(src)
        .pipe(filterTest())
        .pipe(tsProject(gulpTs.reporter.fullReporter()));

      return rs;
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
    });

    const vueResult = gulp
      .src(getSourceDirArray('vue'))
      .pipe(filterTest())
      .pipe(
        gulpVue({
          tsCompilerOptions: {
            ...BASE_COMPILER_OPTIONS_FN(false),
          },
        }),
      )
      .pipe(gulp.dest(TARGET_DIR));

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

    return merge2([
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
    ]).on('finish', callback);
  }

  gulp.task('compile-with-es', done => {
    logger.info('[Parallel] Compile to es...');
    compile(false, done);
  });

  gulp.task('compile-with-lib', done => {
    logger.info('[Parallel] Compile to js...');
    compile(true, done);
  });

  gulp.task('compile', gulp.parallel('compile-with-es', 'compile-with-lib'));

  return gulp;
};
