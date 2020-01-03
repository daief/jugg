/**
 * ref: @vue/cli-service@3.0.5/lib/PluginAPI
 */
import { resolve } from 'path';
import { Jugg } from '.';
import {
  CommandSchema,
  JuggConfigChainFun,
  WebpackChainFun,
} from './interface';

export class PluginAPI {
  id: string;

  jugg: Jugg;

  /**
   * @param id plugin id
   * @param jugg Jugg instance
   */
  constructor(id: string, jugg: Jugg) {
    this.id = id;
    this.jugg = jugg;
  }

  /**
   * Current working directory.
   */
  getCwd() {
    return this.jugg.context;
  }

  /**
   * Resolve path for a project.
   *
   * @param {string} path - Relative path from project root
   * @return {string} The resolved absolute path.
   */
  resolve(path: string) {
    return resolve(this.jugg.context, path);
  }

  // hasPlugin (id: string) {
  // }

  /**
   * Register a command that will become available as `jugg [name]`.
   * @param command
   */
  registerCommand(command: CommandSchema) {
    this.jugg.commands.push(command);
  }

  /**
   * Register a function that will receive a chainable webpack config
   * @param chainFun
   */
  chainWebpack(chainFun: WebpackChainFun) {
    this.jugg.webpackChainFns.push(chainFun);
  }

  /**
   * 添加一个方法，用于扩展 JuggConfig
   * @param chainFun
   */
  chainJuggConfig(chainFun: JuggConfigChainFun) {
    this.jugg.juggConfigChainFns.push(chainFun);
  }
}
