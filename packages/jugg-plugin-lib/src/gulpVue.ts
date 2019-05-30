import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import {
  assemble,
  AssembleOptions,
  createDefaultCompiler,
  ScriptOptions,
  StyleOptions,
  TemplateOptions,
} from '@vue/component-compiler';
import path from 'path';
import through2 from 'through2';

export interface IOptions {
  compilerOptions?: {
    script?: ScriptOptions | undefined;
    style?: StyleOptions | undefined;
    template?: TemplateOptions | undefined;
  };
  assembleOptions?: AssembleOptions;
}

/**
 * convert signle `vue` to `js`
 * @param opts
 * @param api
 */
export function gulpVue(opts: IOptions = {}, _?: PluginAPI) {
  const { compilerOptions = {}, assembleOptions = {} } = opts;

  return through2.obj((file, __, callback) => {
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

    // // TODO the part of ts maybe extracted
    // // use Ts to compile
    // const tsConfig = ts.readConfigFile(tsConfigFile, ts.sys.readFile);
    // if (tsConfig.error) {
    //   api.jugg.Utils.logger.error(`${tsConfig.error.messageText}`);
    // }

    // const parsed: ts.ParsedCommandLine = ts.parseJsonConfigFileContent(
    //   tsConfig.config || {},
    //   {
    //     useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    //     readDirectory: () => [],
    //     fileExists: ts.sys.fileExists,
    //     readFile: ts.sys.readFile,
    //   },
    //   dirname(tsConfigFile),
    //   tsCompilerOptions,
    // );

    // if (parsed.errors) {
    //   // api.jugg.Utils.logger.error(`${parsed.errors}`);
    //   // reportErrors(parsed.errors, typescript, [18003]);
    // }

    // const tsResult = ts.transpileModule(result.code, {
    //   compilerOptions: parsed.options,
    //   transformers: {
    //     before: [transformerFactory()],
    //   },
    // });
    // const resultCode = tsResult.outputText;

    file.path = file.path.replace(/\.vue$/, '.js');

    file.contents = Buffer.from(result.code);

    callback(null, file);
  });
}

export default gulpVue;
