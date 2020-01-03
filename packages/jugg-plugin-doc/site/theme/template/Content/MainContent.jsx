import React from 'react';
import { withRouter } from 'react-router-dom';
import { Row, Col, Affix } from 'antd';
import classNames from 'classnames';
import MobileMenu from 'rc-drawer';
import Article from './Article';
import ComponentDoc from './ComponentDoc';
import { useIsMobile } from '../hooks/useMedia';
import { useMdCtx } from '../../../store/md';
import { MenuContent } from '../../../store/menu';
import useScrollTop from '../hooks/useScrollTop';
import NotFound from '../NotFound';

const { useState, useMemo } = React;

function getOpenKeys(location) {
  let r = '';
  try {
    r = decodeURIComponent(location.pathname.split('/').filter(Boolean)[0]);
  } catch (error) {}
  return [r].filter(Boolean);
}

/**
 * 检查当前页 isArticle、isTimeline
 * @param {*} md
 * @param {*} pathname
 */
function useCheckIsArticleAndTimeline(md, pathname) {
  return useMemo(() => {
    const pathResult = /docs\//.test(pathname);
    let isTimeline = false;
    if (!md) {
      return {
        isArticle: pathResult,
        isTimeline,
      };
    }

    const { layout, title, timeline } = md.metadata;
    isTimeline =
      timeline !== void 0 ? !!timeline : 'CHANGELOG' === title.toUpperCase();

    if (
      layout === 'article' ||
      (!layout && ['README', 'CHANGELOG'].includes(title.toUpperCase()))
    ) {
      return {
        isArticle: true,
        isTimeline,
      };
    }

    if (layout === 'demo') {
      return {
        isArticle: false,
        isTimeline,
      };
    }

    return {
      isArticle: pathResult,
      isTimeline,
    };
  }, [md, pathname]);
}

/**
 *
 */
export default withRouter(function MainContent(props) {
  const { pageMap } = useMdCtx();
  const { location } = props;

  useScrollTop();

  const md = pageMap.get(location.pathname);

  const { isArticle, isTimeline } = useCheckIsArticleAndTimeline(
    md,
    location.pathname,
  );

  const Content = md ? (
    isArticle ? (
      <Article md={md} timeline={isTimeline} />
    ) : (
      <ComponentDoc md={md} />
    )
  ) : (
    <NotFound />
  );

  const [openKeys, setOpenKeys] = useState(getOpenKeys(location));

  const mainContainerClass = classNames('main-container', {
    'main-container-component': !isArticle,
  });

  const menuChild = (
    <MenuContent
      openKeys={openKeys}
      selectedKeys={[location.pathname]}
      onOpenChange={setOpenKeys}
    />
  );

  const isMobile = useIsMobile();

  return (
    <div className="main-wrapper">
      <Row>
        {isMobile ? (
          <MobileMenu key="Mobile-menu" wrapperClassName="drawer-wrapper">
            {menuChild}
          </MobileMenu>
        ) : (
          <Col
            xxl={4}
            xl={5}
            lg={6}
            md={24}
            sm={24}
            xs={24}
            className="main-menu"
          >
            <Affix>
              <section className="main-menu-inner">{menuChild}</section>
            </Affix>
          </Col>
        )}
        <Col
          xxl={20}
          xl={19}
          lg={18}
          md={24}
          sm={24}
          xs={24}
          className={mainContainerClass}
        >
          {Content}
        </Col>
      </Row>
    </div>
  );
});
