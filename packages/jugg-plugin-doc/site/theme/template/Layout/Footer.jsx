import React from 'react';
import { Row, Col, Icon } from 'antd';

class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <footer id="footer">
        <div className="footer-wrap">
          <Row>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>相关资源</h2>
                <div>
                  <a target="_blank" href="https://ant.design/index-cn">
                    Ant Design
                  </a>
                </div>
                <div>
                  <a target="_blank" href="http://pro.ant.design">
                    Ant Design Pro
                  </a>
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>技术栈</h2>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/facebook/react"
                  >
                    React
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/vuejs/vue"
                  >
                    Vue
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/webpack/webpack"
                  >
                    webpack
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/microsoft/TypeScript"
                  >
                    TypeScript
                  </a>
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>帮助</h2>
                <div>
                  <a
                    target="_blank "
                    href="https://github.com/daief/jugg/issues"
                  >
                    Issues
                  </a>
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2>Me</h2>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/daief/jugg"
                  >
                    Jugg
                  </a>
                </div>
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/daief"
                  >
                    <Icon type="github" /> Github
                  </a>
                </div>
                <div>
                  <a target="_blank" href="https://daief.tech">
                    <Icon type="book" /> Blog
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="bottom-bar">
          Thank{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://yuque.com/afx/blog"
          >
            AFX's
          </a>{' '}
          <span className="heart">❤</span> & Rewrited by{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/daief/jugg"
          >
            jugg
          </a>
        </div>
      </footer>
    );
  }
}

export default Footer;
