/**
 * simple event bus
 */
export default class {
  private listeners: { [k: string]: Item[] } = {};

  on(type: string, fun: (p?: any) => void, opts?: Opts) {
    if (!type) {
      return;
    }

    this.listeners[type] = [
      ...(this.listeners[type] || []),
      {
        callback: fun,
        opts,
      },
    ];
  }

  off(type: string, fun: () => void) {
    this.listeners[type] = (this.listeners[type] || []).filter(item => item.callback !== fun);
  }

  dispatch(type: string, data: any) {
    const items = this.listeners[type] || [];

    items.forEach(item => {
      const { callback, opts = {} } = item;

      callback && callback(data);

      if (opts.once === true) {
        this.off(type, callback);
      }
    });
  }

  clear(type?: string) {
    if (type) {
      this.listeners[type] = [];
    } else {
      this.listeners = {};
    }
  }
}

export interface Item {
  callback: (p?: any) => void;
  opts: Opts;
}

export interface Opts {
  once?: boolean;
}
