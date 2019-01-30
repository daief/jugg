import gulp from 'gulp';
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import through2 from 'through2';
import transformLess from './transformLess';
import ts from 'gulp-typescript';
import merge2 from 'merge2';

export interface IOptions {
  /**
   * convert less import in es/lib to css file path, default `true`
   */
  convertLessImport2Css?: boolean;
}

export default (opts: IOptions, api: PluginAPI) => {
  const { convertLessImport2Css = true } = opts;

  const { getAbsolutePath, logger } = api.jugg.Utils;
  const LIB_DIR = getAbsolutePath('lib');
  const ES_DIR = getAbsolutePath('es');

  function compile(modules: boolean) {
    const TARGET_DIR = modules === false ? ES_DIR : LIB_DIR;
    const less = gulp
      .src(['src/**/*.less'])
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
        })
      )
      .pipe(gulp.dest(TARGET_DIR));

    // copy files
    const assets = gulp
      .src([
        'src/**/*.@(png|jpg|jpeg|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf|otf)',
      ])
      .pipe(gulp.dest(TARGET_DIR));

    const tsProject = ts.createProject(getAbsolutePath('tsconfig.json'), {
      target: 'es5',
      noUnusedParameters: true,
      noUnusedLocals: true,
      strictNullChecks: true,
      moduleResolution: 'node',
      allowSyntheticDefaultImports: true,
      module: modules ? 'commonjs' : 'esnext',
    });

    const tsDefaultReporter = ts.reporter.defaultReporter();
    let errors = 0;
    const tsResult = gulp.src(['src/**/*.@(ts|tsx|js|jsx)']).pipe(
      tsProject({
        error(e: any) {
          tsDefaultReporter.error(e);
          errors += 1;
        },
        finish: tsDefaultReporter.finish,
      })
    );

    function check() {
      if (errors) {
        process.exit(1);
      }
    }

    tsResult.on('finish', check);
    tsResult.on('end', check);

    return merge2([
      less,
      tsResult.js
        .pipe(
          through2.obj(function z(file, encoding, next) {
            this.push(file.clone());
            if (file.path.match(/(\/|\\)style(\/|\\)index\.js/) && convertLessImport2Css === true) {
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
          })
        )
        .pipe(gulp.dest(TARGET_DIR)),
      tsResult.dts.pipe(gulp.dest(TARGET_DIR)),
      assets,
    ]);
  }

  gulp.task('compile-with-es', done => {
    logger.info('[Parallel] Compile to es...');
    compile(false).on('finish', done);
  });

  gulp.task('compile-with-lib', done => {
    logger.info('[Parallel] Compile to js...');
    compile(true).on('finish', done);
  });

  gulp.task('compile', gulp.parallel('compile-with-es', 'compile-with-lib'));

  return gulp;
};
