import { useContext, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import analytics from '#client/analytics/analytics.js';
import log from '#client/lib/log.js';
import ReactAppContext from '#client/core/ReactAppContext.js';
import useIsMounted from '#client/hooks/useIsMounted.js';
import useDispatch from '#client/hooks/useDispatch.js';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';
import useBranch from '#client/hooks/useBranch.js';

/**
 * Changes the page title HTML tag.
 * Only works on browser side.
 *
 * @param {string} title The new title to set.
 */
const setPageTitle = (title) => {
  const headTitleEl = global.document?.querySelector('head title');
  if (headTitleEl) {
    headTitleEl.innerHTML = title; // Set the innerHTML of the title element to the new title
  }
}

/**
 * Manage page transitions.
 *
 * @param {function} options.fetchPageData Function to fetch page data.
 * @param {function} options.getMetadata Function to get page metadata.
 * @returns {boolean} Whether a transition is in progress.
 */
const useTransitionHook = ({ fetchPageData, getMetadata } = {}) => {
  useScrollToTop();
  const { state } = useContext(ReactAppContext);
  const isMounted = useIsMounted();
  const params = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const { pathHistory, isTransitioning } = useBranch({
    pathHistory: ['analytics', 'pathHistory'],
    isTransitioning: 'isTransitioning',
  });

  useEffect(() => {
    state.push(['analytics', 'pathHistory'], location.pathname);

    // Skip the effect on the first render
    if (pathHistory.length === 0) {
      analytics.pageview();
      return;
    }

    state.set('isTransitioning', true);

    // Fetch page data if fetchPageData function is provided, otherwise resolve immediately
    const fetchPageDataPromise = !fetchPageData
      ? Promise.resolve()
      : fetchPageData({ dispatch, params });

    fetchPageDataPromise.then(() => {
      if (!isMounted()) {
        return;
      }

      const pageMetadata = {
        ...(state.get('pageMetadataDefault') || {}),
        ...(!getMetadata ? {} : getMetadata({
          state: state,
          params,
        })),
      };

      state.set('pageMetadata', pageMetadata);
      setPageTitle(pageMetadata.pageTitle);

      state.set('isTransitioning', false);
      state.set('pendingCommit', false);

      // Commit the changes to the state
      state.commit();
    })
    .catch((error) => {
      log.error(error);

      if (isMounted()) {
        state.set('isTransitioning', false);
        state.set('pendingCommit', false);
        state.commit();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return isTransitioning;
}

export default useTransitionHook;
