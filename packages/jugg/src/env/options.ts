import merge from 'lodash/merge';
import { Jugg } from '..';
import { CHAIN_CONFIG_MAP } from './chainCfgMap';

export interface IConfigStore {
  [k: string]: (j: Jugg) => any;
}

/**
 * 用于统一管理 webpack 中插件、loader等等的配置项
 */
export class WebpackOptionsManager {
  jugg: Jugg;

  /**
   * 配置项存储对象
   */
  store: IConfigStore = {};

  /**
   * 维护的拦截层，用于干涉获取配置项时的值
   */
  private filters: Array<
    (id: string, preOpts: any, originalOpts: any) => any
  > = [];

  constructor({ jugg }: { jugg: Jugg }) {
    this.jugg = jugg;
    this.register(builtInOptions);
  }

  /**
   * 查找对应的配置项
   * @param id
   */
  findOpts(id: string) {
    const factory = this.store[id];
    const opts = typeof factory === 'function' ? factory(this.jugg) : void 0;
    return this.filters.reduce((result, filter) => {
      result = filter(id, result, opts);
      return result;
    }, opts);
  }

  /**
   * 注册配置项
   * @param id
   * @param factory
   */
  register(id: string | IConfigStore, factory?: (j: Jugg) => any) {
    if (typeof id === 'string') {
      this.store[id] = factory;
    } else {
      this.store = merge({}, this.store, id);
    }
  }

  /**
   * 添加拦截器
   * @param filter
   */
  addFilter(filter: (id: string, preOpts: any) => any) {
    this.filters.push(filter);

    return () => {
      // remove
      const idx = this.filters.findIndex(_ => _ === filter);
      if (idx > -1) {
        this.filters.splice(idx, 1);
      }
    };
  }
}

export const builtInOptions: IConfigStore = {
  [CHAIN_CONFIG_MAP.entry.INDEX]: () => {
    return './src/index';
  },
};
