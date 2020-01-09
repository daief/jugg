/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-10-18 15:00:59
 * @LastEditTime: 2020-01-09 19:07:41
 * @Description:
 */
import * as React from 'react';
import { render } from 'react-dom';
// @ts-ignore
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom';
import { MdWrap, useMdCtx } from './store/md';
import './theme/static/style';
import Content from './theme/template/Content';
import Home from './theme/template/Home';
import Layout from './theme/template/Layout/index';
import NotFound from './theme/template/NotFound';
import { mountReactGlobal } from './theme/template/utils';

mountReactGlobal();

// prettier-ignore
declare var THEME_CONFIG: Record<string, any>;

const Router = THEME_CONFIG.mode === 'browser' ? BrowserRouter : HashRouter;

const LayoutRoute = (props: any) => {
  const r = <Route {...props} />;
  return props.layout === false ? r : <Layout>{r}</Layout>;
};

const AppRoutes = () => {
  const { pageMap } = useMdCtx()!;
  return (
    <Switch>
      <LayoutRoute path="/" exact component={Home} />
      {[...pageMap.entries()].map(([key]) => (
        <LayoutRoute path={key} key={key} exact component={Content} />
      ))}
      <LayoutRoute path="*" exact component={NotFound} layout={false} />
    </Switch>
  );
};

if (typeof document !== 'undefined') {
  render(
    <MdWrap>
      <Router basename={THEME_CONFIG.basename || '/'}>
        <AppRoutes />
      </Router>
    </MdWrap>,
    document.getElementById('app'),
  );
}
