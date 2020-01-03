/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-10-29 17:12:58
 * @LastEditTime: 2019-11-01 15:29:45
 * @Description:
 */
export interface IMetadata {
  title: string;
  order?: number;
  cols?: number;
  layout?: 'article' | 'demo';
}

export interface IDemo {
  code: string;
  codeHtml: string;
  description: string;
  module: any;
  title: string;
}

export interface IMarkdown {
  extra: string;
  metadata: IMetadata;
  defauult: IDemo[];
  html: string;
  // 入口文件后续挂上的
  category: string;
}

export type IDataSource = Record<string, Record<string, IMarkdown>>;

export interface IMenuItem {
  title: string;
  path?: string;
  children?: IMenuItem[];
}
