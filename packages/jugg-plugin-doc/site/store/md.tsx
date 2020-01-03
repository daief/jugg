/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-10-19 10:16:41
 * @LastEditTime: 2019-11-01 15:33:31
 * @Description:
 */

import * as React from 'react';
// @ts-ignore
import mds, { pageMap } from 'site/mds';
import { IDataSource, IMarkdown, IMenuItem } from '../interface/md';
import { menuData } from './menu';

export const mdCtx = React.createContext<{
  /**
   * 路由与 md map 对象
   */
  pageMap: Map<string, IMarkdown>;
  /**
   * markdown 数据源
   */
  markdown: IDataSource;
  /**
   * 菜单数据
   */
  menuData: IMenuItem[];
} | null>(null);

export function useMdCtx() {
  return React.useContext(mdCtx);
}

export const MdWrap = ({ children }) => {
  const ctxVal = React.useMemo(() => {
    return {
      pageMap,
      markdown: mds,
      menuData,
    };
  }, []);
  return <mdCtx.Provider value={ctxVal}>{children}</mdCtx.Provider>;
};
