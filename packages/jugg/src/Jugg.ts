import Config from 'webpack-chain';
import merge from 'webpack-merge';
import resolveCwd from 'resolve-cwd';
import { JuggConfig, Plugin, WebpackChainFun, CommandSchema } from './interface';
import { readConfig, getAbsolutePath, isUserConfigChanged, searchPlaces } from './utils';
import { logger } from './utils/logger';
import readTs from './utils/readTs';
import { PluginAPI } from './PluginAPI';
import program, { CommanderStatic } from 'commander';
import { Configuration } from 'webpack';
import { resolve, join } from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import EventBus, { Opts } from './utils/EventBus';
import { loadEnv } from './utils/loadEnv';
import { CHAIN_CONFIG_MAP } from './env/chainCfgMap';
const packageJSON = require(resolve(__dirname, '../package.json'));

const WATCH_CONFIG_CHANGE_EVENT = 'jugg/WATCH_CONFIG_CHANGE_EVENT';

export default class Jugg {
  context: string = '';
  commands: CommandSchema[] = [];
  webpackChainFns: WebpackChainFun[] = [];

  private fsWatcher: FSWatcher = null;
  private eventBus: EventBus = null;

  private commander: CommanderStatic;

  private juggConfig: JuggConfig = {};
  private initialized = false;

  constructor(context: string) {
    this.context = context;
    this.commander = program;

    this.fsWatcher = chokidar.watch(searchPlaces('jugg').map(name => join(this.context, name)));
    this.eventBus = new EventBus();

    this.loadEnv();

    this.init();

    this.fsWatcher.on('change', p => this.handleConfigChange(p));
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

  get Utils() {
    return {
      resolveCwd,
      logger,
      readTs,
      getAbsolutePath,
      CHAIN_CONFIG_MAP,
    };
  }

  /**
   * 初始化
   */
  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    this.juggConfig = readConfig();

    this.loadPlugins();

    this.registerCommands();
  }

  /**
   * 加载插件
   */
  loadPlugins() {
    const { plugins } = this.JConfig;

    const builtIn: string[] = ['./run/dev', './run/build'].map(p => resolve(__dirname, p));

    [...builtIn, ...(plugins || [])]
      .map(p => {
        const [moduleId, plOpt] = Array.isArray(p) ? p : [p, {}];
        return [moduleId, plOpt];
      })
      .map((p: [string, any]) => {
        if (/^\./.test(p[0])) {
          // relative path plugin
          return [getAbsolutePath(p[0]), p[1]];
        } else {
          return p;
        }
      })
      .map((p: [string, any]) => {
        const [moduleId, plOpt] = p;
        try {
          const pluginFun: Plugin = require(moduleId).default || require(moduleId);
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
    const defaultCfg: Config = require(this.IsProd ? './env/prod' : './env/dev').default(this);

    // 2. merge plugin chain-config to defaultCfg, get object cfg
    const pluginsWebpackObjectCfgList: Configuration[] = this.webpackChainFns
      .map(fn => fn({ config: defaultCfg, webpack: defaultCfg.toConfig() }))
      //  type predicate, ref: https://stackoverflow.com/a/46700791/10528190
      .filter((cfg): cfg is Configuration => !!cfg);

    const mergedPluginsWebpackObjectCfg: Configuration = merge(...pluginsWebpackObjectCfgList);

    // 3. handle user chain-config and object cfg
    const { webpack } = this.juggConfig;
    const userWebpackObjectCfg: Configuration | void =
      typeof webpack === 'function'
        ? webpack({ config: defaultCfg, webpack: defaultCfg.toConfig() })
        : webpack;

    // 4. merge all
    return merge(defaultCfg.toConfig(), mergedPluginsWebpackObjectCfg, userWebpackObjectCfg || {});
  }

  /**
   * 注册监听配置文件变化
   * @param callback 回调
   */
  onWatchConfigChange(callback: (p?: any) => void, opts?: Opts) {
    this.eventBus.on(WATCH_CONFIG_CHANGE_EVENT, callback, opts);
  }

  /**
   * 清空、重新加载
   * TODO 是否需要重新加载 env
   */
  reload() {
    this.commands = [];
    this.webpackChainFns = [];

    this.juggConfig = {};
    this.initialized = false;

    this.eventBus.clear(WATCH_CONFIG_CHANGE_EVENT);

    this.init();
  }

  /**
   * some thing should be close before exit
   */
  exit() {
    this.fsWatcher.close();
  }

  /**
   * load env
   * TODO load mode .env file
   */
  private loadEnv() {
    const c = this.commander.parse(process.argv);
    const cName = c.args ? c.args[0] : '';
    const basePath = getAbsolutePath('.env');

    try {
      loadEnv(basePath);
    } catch (err) {
      // only ignore error if file is not found
      if (err.toString().indexOf('ENOENT') < 0) {
        logger.error(err);
      }
    }

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
    const key = isUserConfigChanged(this.juggConfig);

    key && this.eventBus.dispatch(WATCH_CONFIG_CHANGE_EVENT, key);
  }
}
