import React, { useContext, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import lodashCompact from 'lodash/fp/compact.js';

import analytics from '#client/analytics/analytics.js';
import log from '#client/lib/log.js';
import ReactAppContext from '#client/core/ReactAppContext.js';
import configureDecoratedComponent from '#client/helpers/configureDecoratedComponent.js';

import useIsMounted from '#client/hooks/useIsMounted.js';

/**
 * Changes the page title HTML tag.
 *
 * @param {string} title The new title to set.
 */
function setPageTitle(title) {
  global.document.querySelector('head title').innerHTML = title;
}

export default function withTransitionHook(ComponentToDecorate) {
  function DecoratedComponent(props) {
    const reactAppContext = useContext(ReactAppContext);
    const { tree, apiClient } = reactAppContext;
    const isMounted = useIsMounted();
    const [isTransitioning, setIsTransitioning] = useState(true);
    const params = useParams();
    const location = useLocation();

    useEffect(() => {
      setIsTransitioning(true);
      tree.set('isTransitioning', true);

      Promise.resolve()
        .then(() => {
          if (ComponentToDecorate.fetchData) {
            return ComponentToDecorate.fetchData({ params }, {
              state: tree,
              apiClient: apiClient,
              location: {
                search: location.search,
              },
            });
          }
        })
        .then(() => {
          if (!isMounted()) {
            return;
          }
          let pageMetadata = {};
          if (ComponentToDecorate.getPageMetadata) {
            pageMetadata = ComponentToDecorate.getPageMetadata(tree, { params });
          }

          if (!pageMetadata.pageTitle && ComponentToDecorate.pageTitle) {
            pageMetadata.pageTitle = lodashCompact([
              tree.get(['env', 'APP_TITLE']),
              pageTitle,
            ]).join(' | ');
          }

          if (Object.keys(pageMetadata).length > 0) {
            tree.set('pageMetadata', pageMetadata);
            tree.set('pendingCommit', true);
          }

          const pageTitle = tree.get(['pageMetadata', 'pageTitle']);
          setPageTitle(pageTitle);

          tree.set('isTransitioning', false);

          // Handle pending state commits.
          if (tree.get('pendingCommit')) {
            tree.set('pendingCommit', false);
            tree.commit();
          }

          setIsTransitioning(false);
          analytics.pageview();
        })
        .catch((error) => {
          log.error(error);
          tree.set('isTransitioning', false);
          tree.commit();
          setIsTransitioning(false);
        });

      return () => {
        setIsTransitioning(false);
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return (
      <ComponentToDecorate
        {...props}
        isTransitioning={isTransitioning}
      />
    );
  }

  configureDecoratedComponent({
    DecoratedComponent: DecoratedComponent,
    OriginalComponent: ComponentToDecorate,
  });

  return DecoratedComponent;
}
