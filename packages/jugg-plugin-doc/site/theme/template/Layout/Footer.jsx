import React from 'react';
// import { FormattedMessage, injectIntl } from 'react-intl';
import { message, Row, Col, Badge, Icon } from 'antd';
import { loadScript } from '../utils';

const FormattedMessage = ({ id }) => id;

class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.lessLoaded = false;

    this.state = {
      color: '#1890ff',
    };
  }

  componentDidMount() {}

  render() {
    const { color } = this.state;
    return (
      <footer id="footer">
        <div className="footer-wrap">
          <Row>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>
                  <FormattedMessage id="app.footer.resources" />
                </h2>
                <div>
                  <a href="http://pro.ant.design">Ant Design Pro</a>
                </div>
                <div>
                  <a href="http://mobile.ant.design">Ant Design Mobile</a>
                </div>
                <div>
                  <a href="http://ng.ant.design">NG-ZORRO</a>
                  <span> - </span>
                  Ant Design of Angular
                </div>
                <div>
                  <a
                    target="_blank "
                    href="https://github.com/websemantics/awesome-ant-design"
                  >
                    <FormattedMessage id="app.footer.awesome" />
                  </a>
                </div>
                <div>
                  <Badge dot offset={[3, 0]}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="http://kitchen.alipay.com"
                    >
                      Kitchen
                    </a>
                    <span> - </span>
                    <FormattedMessage id="app.footer.kitchen" />
                  </Badge>
                </div>
                <div>
                  <a href="http://scaffold.ant.design">Scaffolds</a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.scaffolds" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://umijs.org/"
                  >
                    Umi
                  </a>{' '}
                  - <FormattedMessage id="app.footer.umi" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/dvajs/dva"
                  >
                    dva
                  </a>{' '}
                  - <FormattedMessage id="app.footer.dva" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://motion.ant.design"
                  >
                    Ant Motion
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.motion" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://library.ant.design/"
                  >
                    Axure Library
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.antd-library" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://ux.ant.design"
                  >
                    Ant UX
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.antux" />
                </div>
                <div>
                  <a target="_blank " href="http://ant-design.gitee.io/">
                    <FormattedMessage id="app.footer.chinamirror" />
                  </a>
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>
                  <FormattedMessage id="app.footer.community" />
                </h2>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://zhuanlan.zhihu.com/antdesign"
                  >
                    <FormattedMessage id="app.footer.zhihu" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://medium.com/ant-design/"
                  >
                    Medium
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://twitter.com/antdesignui"
                  >
                    Twitter
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://zhuanlan.zhihu.com/xtech"
                  >
                    <FormattedMessage id="app.footer.zhihu.xtech" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://seeconf.alipay.com/"
                  >
                    SEE Conf
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.seeconf" />
                </div>
                <div>
                  <a target="_blank " href="/docs/spec/work-with-us">
                    <FormattedMessage id="app.footer.work_with_us" />
                  </a>
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>
                  <FormattedMessage id="app.footer.help" />
                </h2>
                <div>
                  <a
                    target="_blank "
                    href="https://github.com/ant-design/ant-design"
                  >
                    GitHub
                  </a>
                </div>
                <div>
                  <a href="/changelog">
                    <FormattedMessage id="app.footer.change-log" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank "
                    href="https://www.yuque.com/ant-design/course"
                  >
                    <FormattedMessage id="app.footer.course" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/ant-design/ant-design/wiki/FAQ"
                  >
                    <FormattedMessage id="app.footer.faq" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://gitter.im/ant-design/ant-design"
                  >
                    <FormattedMessage id="app.footer.discuss-cn" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://gitter.im/ant-design/ant-design-english"
                  >
                    <FormattedMessage id="app.footer.discuss-en" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://new-issue.ant.design/"
                  >
                    <FormattedMessage id="app.footer.bug-report" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/ant-design/ant-design/issues"
                  >
                    <FormattedMessage id="app.footer.issues" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://stackoverflow.com/questions/tagged/antd"
                  >
                    <FormattedMessage id="app.footer.stackoverflow" />
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://segmentfault.com/t/antd"
                  >
                    <FormattedMessage id="app.footer.segmentfault" />
                  </a>
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>
                  <img
                    className="title-icon"
                    src="https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg"
                    alt="AFX Cloud"
                  />
                  <FormattedMessage id="app.footer.more-product" />
                </h2>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://yuque.com/"
                  >
                    <FormattedMessage id="app.footer.yuque" />
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.yuque.slogan" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://yunfengdie.com/"
                  >
                    <FormattedMessage id="app.footer.fengdie" />
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.fengdie.slogan" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://antv.alipay.com/"
                  >
                    AntV
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.data-vis" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://eggjs.org/"
                  >
                    Egg
                  </a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.eggjs" />
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://xcloud.alipay.com/"
                  >
                    <FormattedMessage id="app.footer.xcloud" />
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="bottom-bar">
          Made with <span className="heart">❤</span> by
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://yuque.com/afx/blog"
          >
            <FormattedMessage id="app.footer.company" />
          </a>
        </div>
      </footer>
    );
  }
}

export default Footer;
