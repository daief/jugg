/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-11-01 14:23:01
 * @LastEditTime: 2019-11-07 17:10:48
 * @Description:
 */
import { Affix } from 'antd';
import * as React from 'react';

export default function Jumper(props: { html: string }) {
  const { html = '' } = props;
  const [jumper, setJumper] = React.useState<any>(null);

  React.useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const list = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((_, i) => {
      const k = (_.textContent || '').trim();
      return (
        <li key={k + i}>
          <a href={`#${k}`}>{k}</a>
        </li>
      );
    });
    setJumper(list);
  }, [html]);

  return (
    <Affix className="toc-affix" offsetTop={16}>
      <ul id="demo-toc" className="toc">
        {jumper && jumper.length ? (
          <li style={{ color: 'red', wordBreak: 'break-all', maxWidth: 110 }}>
            暂请不要点击，因为 hash 路由与锚点冲突
          </li>
        ) : null}
        {jumper}
      </ul>
    </Affix>
  );
}
