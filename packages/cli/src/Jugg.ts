import Config from 'webpack-chain';
import merge from 'webpack-merge';
import resolveCwd from 'resolve-cwd';
import { JuggConfig, Plugin, WebpackChainFun } from './interface';
import { mergeJuggWebpack, readConfig, getAbsolutePath } from './utils';
import { commandList } from './bin/commands';

export default class Jugg {
  private juggConfig: JuggConfig = {};
  private isProd: boolean;

  constructor(command: string, argv: any) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.juggConfig = readConfig();
    this.loadPlugins();
    this.run(command, argv);
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
        } catch (_) {
          // TODO warn
          // tslint:disable no-console
          console.log('plugin missing', _);
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

    // plugin & default
    mergeJuggWebpack(defaultCfg, [...cfgs]);

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
