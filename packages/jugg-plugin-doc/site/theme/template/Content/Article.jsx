import React from 'react';
import DocumentTitle from 'react-document-title';
import { Timeline } from 'antd';
import Jumper from './Jumper';

export default class Article extends React.Component {
  static defaultProps = {
    timeline: false,
  };

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const links = [...document.querySelectorAll('.outside-link.internal')];
    if (links.length === 0) {
      return;
    }
  }

  componentWillUnmount() {}

  getArticle() {
    const { md, timeline } = this.props;
    const { extra: article } = md;
    if (!timeline) {
      return (
        <section
          className="markdown api-container"
          dangerouslySetInnerHTML={{ __html: article }}
        />
      );
    }

    if (typeof DOMParser === 'undefined') {
      return <section className="markdown api-container" />;
    }

    const timelineItems = [];
    const beforeItems = [];
    let i = 1;
    const parser = new DOMParser();
    const doc = parser.parseFromString(article, 'text/html');

    [...doc.body.children].forEach(child => {
      if (
        child.tagName === 'H2' &&
        child.nextElementSibling &&
        child.nextElementSibling.tagName === 'UL'
      ) {
        timelineItems.push(
          <Timeline.Item key={i}>
            <div
              dangerouslySetInnerHTML={{
                __html: child.outerHTML + child.nextElementSibling.outerHTML,
              }}
            />
          </Timeline.Item>,
        );
        i += 1;
      } else if (i === 1) {
        beforeItems.push(child.outerHTML);
      }
    });

    return (
      <section className="markdown api-container">
        <div dangerouslySetInnerHTML={{ __html: beforeItems.join(' ') }} />
        <Timeline className="changelog-timeline">{timelineItems}</Timeline>
      </section>
    );
  }

  render() {
    const { props } = this;
    const { md } = props;
    const { metadata, description } = md;
    const { title, subtitle } = metadata;

    return (
      <DocumentTitle title={`${title} - ${THEME_CONFIG.title}`}>
        <>
          <Jumper html={md.html} />
          <article
            className="markdown"
            ref={node => {
              this.node = node;
            }}
          >
            <h1>
              {title}
              {!subtitle ? null : <span className="subtitle">{subtitle}</span>}
            </h1>
            {!description ? null : (
              <section
                className="markdown"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            {/* {!md.toc ||
          md.toc.length <= 1 ||
          metadata.toc === false ? null : (
            <Affix className="toc-affix" offsetTop={16}>
              {props.utils.toReactComponent(
                ['ul', { className: 'toc' }].concat(getChildren(md.toc)),
              )}
            </Affix>
          )} */}
            {/* <section
            className="markdown api-container"
            dangerouslySetInnerHTML={{ __html: this.getArticle() }}
          /> */}
            {this.getArticle()}
          </article>
        </>
      </DocumentTitle>
    );
  }
}
