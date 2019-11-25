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
import * as ts from 'typescript';

let isWarned = false;

export interface IOptions {
  compilerOptions?: {
    script?: ScriptOptions | undefined;
    style?: StyleOptions | undefined;
    template?: TemplateOptions | undefined;
  };
  assembleOptions?: AssembleOptions;
  // config file
  tsconfig?: string;
  cwd?: string;
}

export function compileVueFile(
  content: string,
  filename: string,
  opts: IOptions = {},
) {
  const {
    compilerOptions,
    assembleOptions,
    tsconfig = '',
    cwd = process.cwd(),
  } = opts;
  const {
    assemble,
    createDefaultCompiler,
  } = require('@vue/component-compiler');

  // const { parse } = require('@vue/component-compiler-utils');
  // const templateCompiler = require('vue-template-compiler');
  // const _descriptor = parse({
  //   source: content,
  //   filename,
  //   needMap: true,
  //   compiler: templateCompiler,
  // });

  const compiler = createDefaultCompiler(compilerOptions);
  const descriptor = compiler.compileToDescriptor(filename, content);

  // read tsconfig
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true,
  };
  const configFile = ts.readConfigFile(tsconfig, ts.sys.readFile);
  const compilerOptionsResult = ts.parseJsonConfigFileContent(
    configFile.config,
    parseConfigHost,
    cwd,
  );
  // TS to js
  descriptor.script.code = ts.transpile(
    descriptor.script.code,
    {
      ...compilerOptionsResult.options,
      // stay es module
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.ESNext,
    },
    filename,
  );

  // 这里只能处理 js
  const result = assemble(compiler, filename, descriptor, {
    normalizer: '~' + 'vue-runtime-helpers/dist/normalize-component.js',
    styleInjector: '~' + 'vue-runtime-helpers/dist/inject-style/browser.js',
    styleInjectorSSR: '~' + 'vue-runtime-helpers/dist/inject-style/server.js',
    ...assembleOptions,
  });

  return result.code;
}

/**
 * convert signle `vue` to `js`
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

    file.path = file.path.replace(/\.vue$/, '.js');

    file.contents = Buffer.from(compileVueFile(contentStr, filename, opts));

    callback(null, file);
  });
}

export default gulpVue;
