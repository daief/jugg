import { JuggConfig, Plugin } from './interface';
import { mergeJuggWebpack, readConfig } from './utils';
import { commandList } from './bin/commands';

export default class Jugg {
  private juggConfig: JuggConfig = {};

  constructor(command: string, argv: any) {
    this.juggConfig = readConfig();
    this.loadPlugins();
    this.run(command, argv);
  }

  get JConfig() {
    return this.juggConfig;
  }

  loadPlugins() {
    const { plugins } = this.JConfig;
    const cfgs: JuggConfig[] = (plugins || [])
      .map(p => {
        const [moduleId, plOpt] = Array.isArray(p) ? p : [p, {}];
        try {
          const pluginFun: Plugin = require(moduleId);
          return pluginFun(this, plOpt);
        } catch (_) {
          // TODO warn
          // tslint:disable no-console
          console.log('plugin missing', _);
          return null;
        }
      })
      .filter(c => !!c);
    this.mergeConfig(cfgs);
  }

  run(name: string, opts: any) {
    const idx = commandList.findIndex(s => s.command === name);
    if (idx > -1) {
      require(`./run/${name}`).default(this, opts);
    }
  }

  private mergeConfig(cfgs: JuggConfig[]) {
    const defaultCfg = require(process.env.NODE_ENV === 'production'
      ? './env/prod'
      : './env/dev').default();
    this.juggConfig.webpack = mergeJuggWebpack(
      defaultCfg,
      [...cfgs, this.JConfig].map(cfg => cfg.webpack)
    );
  }
}
