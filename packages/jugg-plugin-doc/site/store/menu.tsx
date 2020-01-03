/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-10-30 17:45:48
 * @LastEditTime: 2019-10-30 17:51:57
 * @Description:
 */
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import * as React from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import mds, { pageMap } from 'site/mds';
import { getMenusFromMds } from '../theme/template/utils';

const { SubMenu } = Menu;

const generateMenuItem = (isTop, item, { before = null, after = null }) => {
  const key = item.path;
  const title = item.title;
  const text = isTop
    ? title
    : [
        <span key="english">{title}</span>,
        <span className="chinese" key="chinese">
          {item.subTitle}
        </span>,
      ];
  const { disabled } = item;
  const url = item.path;

  return (
    <Menu.Item key={key} disabled={disabled}>
      <Link to={url} disabled={disabled}>
        {before}
        {text}
        {after}
      </Link>
    </Menu.Item>
  );
};

export const menuData = getMenusFromMds(mds, pageMap);

// 数据是静态的，所以提前生成菜单数据和组件，方便后续使用
const getMenuItems = (footerNavIcons = {}) => {
  return menuData.map(menuItem => {
    if (menuItem.children) {
      return (
        <SubMenu title={<h4>{menuItem.title}</h4>} key={menuItem.title}>
          {menuItem.children.map(child => {
            return generateMenuItem(false, child, footerNavIcons);
          })}
        </SubMenu>
      );
    }
    return generateMenuItem(true, menuItem, footerNavIcons);
  });
};

const menuItems = getMenuItems();

export const MenuContent = (props: MenuProps) => (
  <Menu
    inlineIndent={40}
    className="aside-container menu-site"
    mode="inline"
    {...props}
  >
    {menuItems}
  </Menu>
);
