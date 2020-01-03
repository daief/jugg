/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-10-18 15:00:59
 * @LastEditTime: 2019-10-30 18:53:33
 * @Description:
 */
import * as React from 'react';
import { IDataSource, IMarkdown, IMenuItem } from '../../interface/md';

/**
 * 在全局对象上挂载 React
 */
export function mountReactGlobal() {
  if (typeof window !== 'undefined' && !window.React) {
    window.React = React;
  } else {
    // @ts-ignore
    global.React = React;
  }
}

/**
 * 动态注入脚本
 * @param src
 */
export function loadScript(src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 根据 markdown 排序
 * @param a
 * @param b
 */
export function sortMd(a: IMarkdown, b: IMarkdown): number {
  const defaultOrder = o => (typeof o === 'number' ? o : 999);
  a.metadata.order = defaultOrder(a.metadata.order);
  b.metadata.order = defaultOrder(b.metadata.order);

  const orderResult = a.metadata.order - b.metadata.order;
  if (orderResult !== 0) {
    return orderResult;
  }
  const titleA = a.metadata.title;
  const titleB = b.metadata.title;

  if (titleA === titleB) {
    return 0;
  }

  return titleA > titleB ? 1 : -1;
}

export function getMenusFromMds(
  dataSource: IDataSource,
  pageMap: Map<string, IMarkdown>,
): IMenuItem[] {
  const keys = Object.keys(dataSource);
  const mapKeys = [...pageMap.keys()];

  const docItems = mapKeys
    .filter(_ => /^\/docs\//.test(_))
    .sort((_1, _2) => sortMd(pageMap.get(_1)!, pageMap.get(_2)!))
    .map(_ => {
      const { metadata } = pageMap.get(_)!;
      const { title } = metadata;

      return {
        title,
        path: _,
      };
    });

  const otherItems = keys
    .filter(_ => _ !== 'docs')
    .map(categoryKey => {
      return {
        title: categoryKey,
        children: mapKeys
          .filter(__ =>
            new RegExp('^/' + encodeURIComponent(categoryKey) + '/').test(__),
          )
          .sort((_1, _2) => {
            return sortMd(pageMap.get(_1)!, pageMap.get(_2)!);
          })
          .map(__ => {
            const { metadata } = pageMap.get(__)!;
            const { title } = metadata;
            return {
              title,
              path: __,
            };
          }),
      };
    });

  return [...docItems, ...otherItems];
}
