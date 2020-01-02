import chokidar, { FSWatcher } from 'chokidar';
import program, { CommanderStatic } from 'commander';
import { resolve } from 'path';
import resolveCwd from 'resolve-cwd';
import { Configuration } from 'webpack';
import Config from 'webpack-chain';
import merge from 'webpack-merge';
import { CHAIN_CONFIG_MAP } from './env/chainCfgMap';
import {
  CommandSchema,
  JuggConfig,
  JuggGlobalCommandOpts,
  Plugin,
  PluginCfgSchema,
  WebpackChainFun,
} from './interface';
import { PluginAPI } from './PluginAPI';
import { isUserConfigChanged, readConfig } from './utils';
import EventBus, { Opts } from './utils/EventBus';
import { loadEnv } from './utils/loadEnv';
import { logger } from './utils/logger';
import { matchTranspileDependencies } from './utils/matchTranspileDependencies';
import readTs from './utils/readTs';
import { WebpackOptionsManager } from './webpack/options';

const packageJSON = require(resolve(__dirname, '../package.json'));

const WATCH_CONFIG_CHANGE_EVENT = 'jugg/WATCH_CONFIG_CHANGE_EVENT';

export default class Jugg {
  context: string = '';
  commands: CommandSchema[] = [];
  webpackChainFns: WebpackChainFun[] = [];

  private webpackOptionsManager: WebpackOptionsManager;
  private fsWatcher: FSWatcher = null;
  private eventBus: EventBus = null;

  private commander: CommanderStatic;

  private juggConfig: JuggConfig = {};
  private initialized = false;

  private globalCommandOpts: JuggGlobalCommandOpts = {
    mode: '',
  };

  constructor(context: string) {
    this.context = context;
    this.commander = program;
    this.webpackOptionsManager = new WebpackOptionsManager({ jugg: this });

    this.globalCommandOpts = this.resolveGlobalCommandOpts();

    this.eventBus = new EventBus();

    this.loadEnv();

    this.init();
  }

  /**
   * user config
   */
  get JConfig() {
    return this.juggConfig;
  }

  get IsProd() {
    return process.env.NODE_ENV === 'production';
  }

  get WebpackOptionsManager() {
    return this.webpackOptionsManager;
  }

  get Utils() {
    return {
      CHAIN_CONFIG_MAP,
      getAbsolutePath: (...p: string[]) => {
        return resolve(this.context, ...p.filter(Boolean));
      },
      logger,
      matchTranspileDependencies,
      readTs,
      resolveCwd,
      resolvePlugin: (p: PluginCfgSchema) => {
        const [_, option = {}] = typeof p === 'string' ? [p, {}] : p;
        const name = /^\./.test(_) ? this.Utils.getAbsolutePath(_) : _;
        return (require(name).default || require(name))(option);
      },
    };
  }

  get JGlobalCommandOpts(): JuggGlobalCommandOpts {
    return this.globalCommandOpts;
  }

  /**
   * 初始化
   */
  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    const { config, configFilePath } = readConfig(this);
    this.juggConfig = config;
    this.globalCommandOpts.configFilePath = configFilePath;

    this.loadPlugins();

    this.registerCommands();
  }

  /**
   * 加载插件
   */
  loadPlugins() {
    const { plugins } = this.JConfig;

    const builtIn: string[] = [
      './run/dev',
      './run/build',
      './run/inspect',
    ].map(p => resolve(__dirname, p));

    [...builtIn, ...(plugins || [])]
      .map(p => {
        const [moduleId, plOpt] = Array.isArray(p) ? p : [p, {}];
        return [moduleId, plOpt];
      })
      .map((p: [string, any]) => {
        if (/^\./.test(p[0])) {
          // relative path plugin
          return [this.Utils.getAbsolutePath(p[0]), p[1]];
        } else {
          return p;
        }
      })
      .map((p: [string, any]) => {
        const [moduleId, plOpt] = p;
        try {
          const pluginFun: Plugin =
            require(moduleId).default || require(moduleId);
          return pluginFun(new PluginAPI(moduleId, this), plOpt);
        } catch (e) {
          logger.error(e, `Plugin \`${moduleId}\` error`);
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

    // config priority: default < plugin < user ,
    //      chain cfg < object cfg

    // 1. get default cfg
    // const defaultCfg: Config = require(this.IsProd
    //   ? './env/prod'
    //   : './env/dev').default(this);
    const defaultCfg: Config = require(this.IsProd
      ? './webpack/prod'
      : './webpack/dev').default(this);

    // 2. merge plugin chain-config to defaultCfg, get object cfg
    const pluginsWebpackObjectCfgList: Configuration[] = this.webpackChainFns
      .map(fn =>
        fn({
          config: defaultCfg,
          webpack: defaultCfg.toConfig(),
          jugg: this,
        }),
      )
      //  type predicate, ref: https://stackoverflow.com/a/46700791/10528190
      .filter((cfg): cfg is Configuration => !!cfg);

    const mergedPluginsWebpackObjectCfg: Configuration = merge(
      ...pluginsWebpackObjectCfgList,
    );

    // 3. handle user chain-config and object cfg
    const { webpack } = this.juggConfig;
    const userWebpackObjectCfg: Configuration | void =
      typeof webpack === 'function'
        ? webpack({
            config: defaultCfg,
            webpack: defaultCfg.toConfig(),
            jugg: this,
          })
        : webpack;

    // 4. merge all
    return merge(
      defaultCfg.toConfig(),
      mergedPluginsWebpackObjectCfg,
      userWebpackObjectCfg || {},
    );
  }

  /**
   * 注册监听配置文件变化
   * @param callback 回调
   */
  onWatchConfigChange(callback: (p?: any) => void, opts?: Opts) {
    if (this.fsWatcher === null) {
      this.fsWatcher = chokidar.watch([this.globalCommandOpts.configFilePath]);
      this.fsWatcher.on('change', p => this.handleConfigChange(p));
    }
    this.eventBus.on(WATCH_CONFIG_CHANGE_EVENT, callback, opts);
  }

  /**
   * 清空、重新加载
   */
  reload() {
    this.commands = [];
    this.webpackChainFns = [];

    this.juggConfig = {};
    this.initialized = false;

    this.eventBus.clear(WATCH_CONFIG_CHANGE_EVENT);
    this.webpackOptionsManager = new WebpackOptionsManager({ jugg: this });

    this.init();
  }

  /**
   * some thing should be close before exit
   * @deprecated
   */
  exit() {
    if (this.fsWatcher) {
      this.fsWatcher.removeAllListeners();
      this.fsWatcher.close();
      this.fsWatcher = null;
    }
  }

  /**
   * clean something
   */
  clean(isExit = true) {
    if (this.fsWatcher) {
      this.fsWatcher.removeAllListeners();
      this.fsWatcher.close();
      this.fsWatcher = null;
    }
    if (isExit) {
      process.exit(0);
    }
  }

  /**
   * load env
   */
  private loadEnv() {
    const c = this.commander.parse(process.argv);
    const cName = c.args ? c.args[0] : '';
    const basePath = this.Utils.getAbsolutePath('.env');

    try {
      loadEnv(basePath);
      loadEnv(
        this.Utils.getAbsolutePath(`.${this.globalCommandOpts.mode}.env`),
      );
    } catch (err) {
      // only ignore error if file is not found
      if (err.toString().indexOf('ENOENT') < 0) {
        logger.error(err);
      }
    }

    process.env.NODE_ENV = this.globalCommandOpts.mode;

    // ❗️ 特殊的，强制覆盖
    if (cName === 'dev') {
      process.env.NODE_ENV = 'development';
    } else if (cName === 'build') {
      process.env.NODE_ENV = 'production';
    }
  }

  /**
   * 注册命令行语句
   */
  private registerCommands() {
    this.commander.removeAllListeners();
    this.commands.forEach(schema => {
      const { command, description, option, action } = schema;
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

  /**
   * handle file change but only config change will dispatch
   * @param _ path
   */
  private handleConfigChange(_: string) {
    const key = isUserConfigChanged(this);

    key && this.eventBus.dispatch(WATCH_CONFIG_CHANGE_EVENT, key);
  }

  private resolveGlobalCommandOpts(): JuggGlobalCommandOpts {
    this.commander
      .option('-C, --config <path>', 'assign the config file')
      .option(
        '-M, --mode <development|production>',
        'assign the process.env.NODE_ENV. default: development',
      );
    const { config, mode } = this.commander.parse(process.argv).opts();
    return {
      configFilePath: config || '',
      mode: mode || 'development',
    };
  }
}
