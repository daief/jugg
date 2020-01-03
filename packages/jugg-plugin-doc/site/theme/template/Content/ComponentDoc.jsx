import React from 'react';
import DocumentTitle from 'react-document-title';
import classNames from 'classnames';
import { Row, Col, Icon, Tooltip } from 'antd';
import Demo from './Demo';
import Jumper from './Jumper';
// @ts-ignore
import { useLocation } from 'react-router-dom';

const { useState, useCallback } = React;

export default function ComponentDoc(props) {
  const [expandAll, setExpandAll] = useState(false);
  const handleExpandToggle = useCallback(() => {
    setExpandAll(!expandAll);
  }, [expandAll]);
  const location = useLocation();

  const { md } = props;
  const { metadata } = md;
  const demos = md.default;

  const isSingleCol = metadata.cols === 1;
  const leftChildren = [];
  const rightChildren = [];

  demos
    // .sort((a, b) => a.meta.order - b.meta.order)
    .forEach((demoData, index) => {
      const demoElem = (
        <Demo
          md={md}
          metadata={md.metadata}
          demo={demoData}
          key={index + demoData.title + location.pathname}
          expand={expandAll}
        />
      );
      if (index % 2 === 0 || isSingleCol) {
        leftChildren.push(demoElem);
      } else {
        rightChildren.push(demoElem);
      }
    });
  const expandTriggerClass = classNames({
    'code-box-expand-trigger': true,
    'code-box-expand-trigger-active': expandAll,
  });

  const { title, subtitle } = metadata;

  return (
    <DocumentTitle title={`${subtitle || ''} ${title} - ${THEME_CONFIG.title}`}>
      <article>
        <Jumper html={md.html} />
        <section className="markdown">
          <h1>
            {title}
            {!subtitle ? null : <span className="subtitle">{subtitle}</span>}
          </h1>
          {/* {props.utils.toReactComponent(
            ['section', { className: 'markdown' }].concat(getChildren(content)),
          )} */}
          <section className="markdown" />
          <h2>
            代码演示
            <Tooltip title={expandAll ? 'collpse' : 'expand'}>
              <Icon
                type={`${expandAll ? 'appstore' : 'appstore-o'}`}
                className={expandTriggerClass}
                onClick={handleExpandToggle}
              />
            </Tooltip>
          </h2>
        </section>
        <Row gutter={16}>
          <Col
            span={isSingleCol ? 24 : 12}
            className={
              isSingleCol ? 'code-boxes-col-1-1' : 'code-boxes-col-2-1'
            }
          >
            {leftChildren}
          </Col>
          {isSingleCol ? null : (
            <Col className="code-boxes-col-2-1" span={12}>
              {rightChildren}
            </Col>
          )}
        </Row>
        <section
          className="markdown api-container"
          dangerouslySetInnerHTML={{ __html: md.extra }}
        />
      </article>
    </DocumentTitle>
  );
}
