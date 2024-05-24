import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import useBranch from 'client/hooks/useBranch';
import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';

export default function withScrollToTopDecorator(ComponentToDecorate) {
  function WithScrollToTop(props) {
    const { shouldRestoreScrollPosition } = useBranch({
      shouldRestoreScrollPosition: ['scroll', 'shouldRestoreScrollPosition'],
    });
    const location = useLocation();

    useEffect(() => {
      if (!shouldRestoreScrollPosition && typeof global.scrollTo === 'function') {
        global.scrollTo(0, 0);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return (
      <ComponentToDecorate
        {...props}
      />
    );
  }

  configureDecoratedComponent({
    DecoratedComponent: WithScrollToTop,
    OriginalComponent: ComponentToDecorate,
  });

  return WithScrollToTop;
}
