/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-10-30 19:25:14
 * @LastEditTime: 2019-10-30 19:25:53
 * @Description:
 */
import { useEffect } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';

export default function useScrollTop() {
  const location = useLocation();
  useEffect(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);
}
