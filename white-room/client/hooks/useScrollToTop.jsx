import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import useBranch from '#client/hooks/useBranch.js';

function useScrollToTop() {
  const { shouldRestoreScrollPosition } = useBranch({
    shouldRestoreScrollPosition: ['scroll', 'shouldRestoreScrollPosition'],
  });
  const location = useLocation();

  useEffect(() => {
    if (!shouldRestoreScrollPosition && typeof global.scrollTo === 'function') {
      global.scrollTo(0, 0);
    }
  }, [location.pathname, shouldRestoreScrollPosition]);
}

export default function useScrollToTopDecorator() {
  return function ScrollToTopDecorator(Component) {
    return function DecoratedComponent(props) {
      useScrollToTop();

      return <Component {...props} />;
    };
  };
}
