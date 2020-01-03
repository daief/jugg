import React from 'react';
import { Menu, Row, Col, Icon, Popover, Input, Badge, Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMedia';

class Header extends React.Component {
  state = {
    menuVisible: false,
  };

  componentDidMount() {}

  handleShowMenu = () => {
    this.setState({
      menuVisible: true,
    });
  };

  handleHideMenu = () => {
    this.setState({
      menuVisible: false,
    });
  };

  onMenuVisibleChange = visible => {
    this.setState({
      menuVisible: visible,
    });
  };

  handleLangChange = () => {};

  render() {
    const { menuVisible } = this.state;
    const { isMobile } = this.props;
    const menuMode = isMobile ? 'inline' : 'horizontal';

    const activeMenuItem = 'home';

    const menu = [
      <Button
        ghost
        size="small"
        onClick={this.handleLangChange}
        className="header-lang-button"
        key="lang-button"
      >
        语言
      </Button>,
      <Menu
        className="menu-site"
        mode={menuMode}
        selectedKeys={[activeMenuItem]}
        id="nav"
        key="nav"
      >
        <Menu.Item key="antd">
          <a
            href="https://ant.design/index-cn"
            className="header-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ant Design
          </a>
        </Menu.Item>
        <Menu.Item key="pro">
          <a
            href="http://pro.ant.design"
            className="header-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            pro
          </a>
        </Menu.Item>
      </Menu>,
    ];

    return (
      <header id="header" className="clearfix">
        {isMobile && (
          <Popover
            overlayClassName="popover-menu"
            placement="bottomRight"
            content={menu}
            trigger="click"
            visible={menuVisible}
            arrowPointAtCenter
            onVisibleChange={this.onMenuVisibleChange}
          >
            <Icon
              className="nav-phone-icon"
              type="menu"
              onClick={this.handleShowMenu}
            />
          </Popover>
        )}
        <Row>
          <Col xxl={4} xl={5} lg={5} md={6} sm={24} xs={24}>
            <Link to={'/'} id="logo">
              <img
                alt="logo"
                src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                style={{ marginRight: 15 }}
              />
              {THEME_CONFIG.title}
            </Link>
          </Col>
          <Col xxl={20} xl={19} lg={19} md={18} sm={0} xs={0}>
            <div id="search-box">
              <Icon type="search" />
              <Input
                ref={ref => (this.searchInput = ref)}
                placeholder={`Search in ${THEME_CONFIG.title}`}
              />
            </div>
            {!isMobile && menu}
          </Col>
        </Row>
      </header>
    );
  }
}

export default withRouter(props => {
  const isMobile = useIsMobile();
  return <Header {...props} isMobile={isMobile} />;
});
