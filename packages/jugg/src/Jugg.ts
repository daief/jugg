import Config from 'webpack-chain';
import merge from 'webpack-merge';
import resolveCwd from 'resolve-cwd';
import { JuggConfig, Plugin, WebpackChainFun, CommandSchema } from './interface';
import { readConfig, getAbsolutePath } from './utils';
import { logger } from './utils/logger';
import readTs from './utils/readTs';
import { PluginAPI } from './PluginAPI';
import program, { CommanderStatic } from 'commander';
import { Configuration } from 'webpack';
import { resolve } from 'path';
const packageJSON = require(resolve(__dirname, '../package.json'));

export default class Jugg {
  context: string = '';
  commands: CommandSchema[] = [];
  webpackChainFns: WebpackChainFun[] = [];

  private commander: CommanderStatic;

  private juggConfig: JuggConfig = {};
  private initialized = false;

  constructor(context: string) {
    this.context = context;
    this.commander = program;

    this.init();
  }

  get JConfig() {
    return this.juggConfig;
  }

  get IsProd() {
    return process.env.NODE_ENV === 'production';
  }

  get Utils() {
    return {
      resolveCwd,
      logger,
      readTs,
      getAbsolutePath,
    };
  }

  async init() {
    if (this.initialized) {
      return;
    }

    this.juggConfig = await readConfig();

    this.loadPlugins();
    this.initialized = true;

    this.registerCommands();

    // 可能不需要在此主动调用，谁需要谁调用
    // this.mergeConfig()
  }

  loadPlugins() {
    const { plugins } = this.JConfig;

    const builtIn: string[] = ['./run/dev', './run/build'].map(p => resolve(__dirname, p));

    // TODO support relative path plugin
    [...builtIn, ...(plugins || [])].map(p => {
      const [moduleId, plOpt] = Array.isArray(p) ? p : [p, {}];
      try {
        const pluginFun: Plugin = require(moduleId).default || require(moduleId);
        return pluginFun(new PluginAPI(moduleId, this), plOpt);
      } catch (e) {
        logger.error(e, `Plugin \`${moduleId}\` missing`);
        return null;
      }
    });
  }

  /**
   * merge config
   */
  mergeConfig(): Configuration {
    if (this.initialized !== true) {
      throw new Error('Jugg now is not initialized');
    }

    // priority: default < plugin < 用户
    // 1. get default cfg
    const defaultCfg: Config = require(this.IsProd ? './env/prod' : './env/dev').default(this);

    // 2. merge plugin config to defaultCfg
    this.webpackChainFns.forEach(fn => {
      fn({ config: defaultCfg, webpack: defaultCfg.toConfig() });
    });

    // 3. merge user config
    const { webpack } = this.juggConfig;
    if (typeof webpack === 'function') {
      webpack({ config: defaultCfg, webpack: defaultCfg.toConfig() });
      this.juggConfig.webpack = defaultCfg.toConfig();
    } else {
      this.juggConfig.webpack = merge(defaultCfg.toConfig(), webpack || {});
    }

    return this.juggConfig.webpack;
  }

  /**
   * 注册命令行语句
   */
  private registerCommands() {
    this.commands.forEach(schema => {
      const { command, description, option, env, action } = schema;
      const line = this.commander.command(command);

      if (description) {
        line.description(description);
      }

      (option || []).forEach(opt => {
        const { flags, description: optDesc, fn, defaultValue } = opt;

        if (fn) {
          line.option(flags, optDesc, fn, defaultValue);
        } else {
          line.option(flags, optDesc, defaultValue);
        }
      });

      line.action(opt => {
        // set env
        Object.keys(env || {}).forEach(key => {
          process.env[key] = env[key];
        });
        // exec
        if (action) {
          action(opt);
        }
      });
    });

    this.commander.version(packageJSON.version).usage('<command> [options]');
    this.commander.parse(process.argv);

    if (this.commander.args.length === 0) {
      // default show help
      this.commander.help();
    }
  }
}
