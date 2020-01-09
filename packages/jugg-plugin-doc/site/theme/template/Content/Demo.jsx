/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';
import { Icon, Tooltip } from 'antd';
import ErrorBoundary from './ErrorBoundary';
import Vue from 'vue';

export default class Demo extends React.Component {
  state = {
    codeExpand: false,
    sourceCode: '',
    copied: false,
    copyTooltipVisible: false,
    showRiddleButton: false,
  };

  constructor(props) {
    super(props);
  }

  demoRef = null;

  get RenderDemo() {
    const { demo } = this.props;
    if (demo.demoType === 'TSX') {
      return demo.module.default || null;
    }

    if (demo.demoType === 'VUE') {
      return <div ref={el => (this.demoRef = el)}></div>;
    }

    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { codeExpand, copied, copyTooltipVisible } = this.state;
    const { expand } = this.props;
    return (
      (codeExpand || expand) !== (nextState.codeExpand || nextProps.expand) ||
      copied !== nextState.copied ||
      copyTooltipVisible !== nextState.copyTooltipVisible
    );
  }

  get HasDemo() {
    return !!this.props.demo.module.default;
  }

  componentDidMount() {
    const { demo } = this.props;
    const { code } = demo;
    this.setState({ sourceCode: code, codeExpand: !this.HasDemo });

    if (demo.demoType === 'VUE' && this.demoRef) {
      new Vue({
        render: h => h(demo.module.default),
      }).$mount(this.demoRef);
    }
  }

  handleCodeExpand = () => {
    const { codeExpand } = this.state;
    this.setState({ codeExpand: !codeExpand });
  };

  saveAnchor = anchor => {
    this.anchor = anchor;
  };

  handleCodeCopied = () => {
    this.setState({ copied: true });
  };

  onCopyTooltipVisibleChange = visible => {
    if (visible) {
      this.setState({
        copyTooltipVisible: visible,
        copied: false,
      });
      return;
    }
    this.setState({
      copyTooltipVisible: visible,
    });
  };

  render() {
    const { state, props } = this;
    const { metadata: meta, highlightedStyle, expand, demo } = props;
    const { copied } = state;

    const codeExpand = state.codeExpand || expand;
    const codeBoxClass = classNames({
      'code-box': true,
      expand: codeExpand,
    });

    const localizedTitle = demo.title;

    const highlightClass = classNames({
      'highlight-wrapper': true,
      'highlight-wrapper-expand': codeExpand,
    });

    const highlightedCode = demo.codeHtml;
    return (
      <section className={codeBoxClass} id={meta.id}>
        <section
          className="code-box-demo"
          style={this.HasDemo ? {} : { padding: '10px' }}
        >
          <ErrorBoundary>{this.RenderDemo}</ErrorBoundary>
        </section>
        <section className="code-box-meta markdown">
          <div className="code-box-title">
            <a href={`#${meta.id}`} ref={this.saveAnchor}>
              {localizedTitle}
            </a>
          </div>
          <div className="code-box-description">
            <div dangerouslySetInnerHTML={{ __html: demo.description }} />
          </div>
          <div className="code-box-actions">
            <CopyToClipboard
              text={state.sourceCode}
              onCopy={this.handleCodeCopied}
            >
              <Tooltip
                visible={state.copyTooltipVisible}
                onVisibleChange={this.onCopyTooltipVisibleChange}
                title={copied ? 'copied' : 'copy'}
              >
                <Icon
                  type={
                    state.copied && state.copyTooltipVisible ? 'check' : 'copy'
                  }
                  className="code-box-code-copy"
                />
              </Tooltip>
            </CopyToClipboard>
            <Tooltip title={codeExpand ? 'Hide Code' : 'Show Code'}>
              <span className="code-expand-icon">
                <img
                  alt="expand code"
                  src="https://gw.alipayobjects.com/zos/rmsportal/wSAkBuJFbdxsosKKpqyq.svg"
                  className={
                    codeExpand
                      ? 'code-expand-icon-hide'
                      : 'code-expand-icon-show'
                  }
                  onClick={this.handleCodeExpand}
                />
                <img
                  alt="expand code"
                  src="https://gw.alipayobjects.com/zos/rmsportal/OpROPHYqWmrMDBFMZtKF.svg"
                  className={
                    codeExpand
                      ? 'code-expand-icon-show'
                      : 'code-expand-icon-hide'
                  }
                  onClick={this.handleCodeExpand}
                />
              </span>
            </Tooltip>
          </div>
        </section>
        <section className={highlightClass} key="code">
          <div
            className="highlight"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
          {highlightedStyle ? (
            <div key="style" className="highlight">
              <pre>
                <code
                  className="css"
                  dangerouslySetInnerHTML={{ __html: highlightedStyle }}
                />
              </pre>
            </div>
          ) : null}
        </section>
      </section>
    );
  }
}
