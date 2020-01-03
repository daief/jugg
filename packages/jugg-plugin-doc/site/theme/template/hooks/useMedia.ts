/*
 * @Author: daief
 * @LastEditors: daief
 * @Date: 2019-10-30 11:49:40
 * @LastEditTime: 2019-10-30 11:54:15
 * @Description:
 */
import * as React from 'react';

const addEventListener = (target, fn) => {
  if (target.addEventListener) {
    target.addEventListener('change', fn);
  } else if (target.addListener) {
    // 兼容 safari
    target.addListener(fn);
  }
};

const removeEventListener = (target, fn) => {
  if (target.removeEventListener) {
    target.removeEventListener('change', fn);
  } else if (target.removeListener) {
    // 兼容 safari
    target.removeListener(fn);
  }
};

/**
 * 媒体查询 hook
 * @param query
 */
export function useMatchMedia(
  query: string,
): {
  result: MediaQueryList | null;
  matches?: boolean;
} {
  const [mediaQuery, setMediaQuery] = React.useState<MediaQueryList | null>(
    null,
  );
  const [matches, setMatches] = React.useState<boolean>();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const matchResult = matchMedia(query);
      setMediaQuery(matchResult);
      const onChange = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      // matchResult.addEventListener('change', onChange);
      addEventListener(matchResult, onChange);

      return () => {
        // matchResult.removeEventListener('change', onChange);
        removeEventListener(matchResult, onChange);
      };
    } else {
      setMediaQuery(null);
    }
  }, [query]);

  React.useEffect(() => {
    if (mediaQuery) {
      setMatches(mediaQuery.matches);
    }
  }, [mediaQuery]);

  return {
    result: mediaQuery,
    matches,
  };
}

useMatchMedia.DIMENSION_MAP = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
};

export function useIsMobile() {
  return !!useMatchMedia(`(max-width:${useMatchMedia.DIMENSION_MAP.sm})`)
    .matches;
}
