import Config from 'webpack-chain';
import merge from 'webpack-merge';
import resolveCwd from 'resolve-cwd';
import { JuggConfig, Plugin, WebpackChainFun } from './interface';
import { readConfig, getAbsolutePath } from './utils';
import { logger } from './utils/logger';
import readTs from './utils/readTs';
import { commandList } from './bin/commands';

export default class Jugg {
  private juggConfig: JuggConfig = {};
  private isProd: boolean;

  constructor(command: string, argv: any) {
    this.isProd = process.env.NODE_ENV === 'production';
    readConfig().then(config => {
      this.juggConfig = config;
      this.loadPlugins();
      this.run(command, argv);
    });
  }

  get JConfig() {
    return this.juggConfig;
  }

  get IsProd() {
    return this.isProd;
  }

  get Utils() {
    return {
      getAbsolutePath,
      resolveCwd,
      logger,
      readTs,
    };
  }

  loadPlugins() {
    const { plugins } = this.JConfig;
    const cfgs = (plugins || [])
      .map(p => {
        const [moduleId, plOpt] = Array.isArray(p) ? p : [p, {}];
        try {
          const pluginFun: Plugin = require(moduleId).default;
          return pluginFun(this, plOpt);
        } catch (e) {
          logger.error(e, `Plugin \`${moduleId}\` missing`);
          return null;
        }
      })
      .filter(c => !!c) as WebpackChainFun[];
    this.mergeConfig(cfgs);
  }

  run(name: string, opts: any) {
    const idx = commandList.findIndex(s => s.command === name);
    if (idx > -1) {
      require(`./run/${name}`).default(this, opts);
    }
  }

  private mergeConfig(cfgs: WebpackChainFun[]) {
    // default < plugin < 用户
    const defaultCfg: Config = require(process.env.NODE_ENV === 'production'
      ? './env/prod'
      : './env/dev').default(this);

    // merge plugin config to defaultCfg
    cfgs.forEach(fn => {
      fn({ config: defaultCfg, webpack: defaultCfg.toConfig() });
    });

    // merge user config
    const { webpack } = this.juggConfig;
    if (typeof webpack === 'function') {
      webpack({ config: defaultCfg, webpack: defaultCfg.toConfig() });
      this.juggConfig.webpack = defaultCfg.toConfig();
    } else {
      this.juggConfig.webpack = merge(defaultCfg.toConfig(), webpack || {});
    }
  }
}
