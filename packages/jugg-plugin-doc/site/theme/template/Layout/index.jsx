import React from 'react';
import 'moment/locale/zh-cn';
import Header from './Header';
import Footer from './Footer';

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // isMobile,
    };
  }

  render() {
    const { children } = this.props;

    return (
      <div className="page-wrapper">
        <Header />
        {children}
        <Footer />
      </div>
    );
  }
}
