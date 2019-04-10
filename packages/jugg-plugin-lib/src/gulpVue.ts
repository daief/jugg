import {
  assemble,
  createDefaultCompiler,
  ScriptOptions,
  StyleOptions,
  TemplateOptions,
  AssembleOptions,
} from '@vue/component-compiler';
import through2 from 'through2';
import * as ts from 'typescript';
import path from 'path';
import transformerFactory from './tsConvertImportFrom';

export interface IOptions {
  compilerOptions?: {
    script?: ScriptOptions | undefined;
    style?: StyleOptions | undefined;
    template?: TemplateOptions | undefined;
  };
  assembleOptions?: AssembleOptions;
  tsCompilerOptions?: ts.CompilerOptions;
}

export function gulpVue(opts: IOptions = {}) {
  const { compilerOptions = {}, assembleOptions = {}, tsCompilerOptions = {} } = opts;

  return through2.obj((file, _, callback) => {
    const filename = path.basename(file.path);

    const contentStr = file.contents.toString();
    const compiler = createDefaultCompiler(compilerOptions);
    const descriptor = compiler.compileToDescriptor(filename, contentStr);

    const result = assemble(compiler, filename, descriptor, {
      normalizer: '~' + 'vue-runtime-helpers/dist/normalize-component.js',
      styleInjector: '~' + 'vue-runtime-helpers/dist/inject-style/browser.js',
      styleInjectorSSR: '~' + 'vue-runtime-helpers/dist/inject-style/server.js',
      ...assembleOptions,
    });

    // TODO the part of ts maybe extracted
    // use Ts to compile
    const tsResult = ts.transpileModule(result.code, {
      compilerOptions: {
        ...tsCompilerOptions,
      },
      transformers: {
        before: [transformerFactory()],
      },
    });
    const resultCode = tsResult.outputText;

    file.path = file.path.replace(/\.vue$/, '.js');

    file.contents = new Buffer(resultCode);

    callback(null, file);
  });
}

export default gulpVue;
