/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-08-15 23:53:23
 * @Description:
 */
import { PluginAPI } from '@axew/jugg/types/PluginAPI';
import {
  // assemble,
  AssembleOptions,
  // createDefaultCompiler,
  ScriptOptions,
  StyleOptions,
  TemplateOptions,
} from '@vue/component-compiler';
import path from 'path';
import through2 from 'through2';

let isWarned = false;

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
export function gulpVue(api: PluginAPI, opts: IOptions = {}) {
  const { compilerOptions = {}, assembleOptions = {} } = opts;

  if (!api.jugg.Utils.resolveCwd.silent('vue-template-compiler')) {
    !isWarned &&
      api.jugg.Utils.logger.warn(
        '`.vue` files will not be resolved. Install `vue-template-compiler` to support.',
        '[jugg-plugin-lib]',
      );
    isWarned = true;
    return through2.obj((file, __, callback) => callback(file));
  }

  const {
    assemble,
    createDefaultCompiler,
  } = require('@vue/component-compiler');

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

    file.path = file.path.replace(/\.vue$/, '.js');

    file.contents = Buffer.from(result.code);

    callback(null, file);
  });
}

export default gulpVue;
