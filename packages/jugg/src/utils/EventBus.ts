/**
 * simple event bus
 */
export default class {
  listeners: { [k: string]: Item[] } = {};

  on(type: string, fun: (p?: any) => void, opts?: Opts) {
    if (!type) {
      return;
    }

    this.listeners[type] = [
      ...(this.listeners[type] || []),
      {
        type,
        callback: fun,
        opts,
      },
    ];
  }

  off(type: string, fun: () => void) {
    this.listeners[type] = (this.listeners[type] || []).filter(item => item.callback !== fun);
  }

  dispatch(type: string, data: any) {
    const item = (this.listeners[type] || []).find(i => i.type === type);
    if (item) {
      const { callback, opts = {} } = item;

      callback && callback(data);

      if (opts.once === true) {
        this.off(type, callback);
      }
    }
  }
}

export interface Item {
  type: string;
  callback: (p?: any) => void;
  opts: Opts;
}

export interface Opts {
  once?: boolean;
}
