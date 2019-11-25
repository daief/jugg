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

export function compileVueFile(
  content: string,
  filename: string,
  opts: IOptions = {},
) {
  const { compilerOptions, assembleOptions } = opts;
  const {
    assemble,
    createDefaultCompiler,
  } = require('@vue/component-compiler');

  const compiler = createDefaultCompiler(compilerOptions);
  const descriptor = compiler.compileToDescriptor(filename, content);

  const result = assemble(compiler, filename, descriptor, {
    normalizer: '~' + 'vue-runtime-helpers/dist/normalize-component.js',
    styleInjector: '~' + 'vue-runtime-helpers/dist/inject-style/browser.js',
    styleInjectorSSR: '~' + 'vue-runtime-helpers/dist/inject-style/server.js',
    ...assembleOptions,
  });

  return result.code;
}

/**
 * convert signle `vue` to `ts`
 * @param opts
 * @param api
 */
export function gulpVue(api: PluginAPI, opts: IOptions = {}) {
  if (!api.jugg.Utils.resolveCwd.silent('vue-template-compiler')) {
    !isWarned &&
      api.jugg.Utils.logger.warn(
        '`.vue` files will not be resolved. Install `vue-template-compiler` to support.',
        '[jugg-plugin-lib]',
      );
    isWarned = true;
    return through2.obj((file, __, callback) => callback(file));
  }

  return through2.obj((file, __, callback) => {
    const filename = path.basename(file.path);

    const contentStr = file.contents.toString();

    file.path = file.path.replace(/\.vue$/, '.ts');

    file.contents = Buffer.from(compileVueFile(contentStr, filename, opts));

    callback(null, file);
  });
}

export default gulpVue;
