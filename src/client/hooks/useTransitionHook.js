import { useContext, useEffect } from 'react';
import { useParams, useLocation, useBlocker } from 'react-router-dom';

import StateContext from '#client/contexts/StateContext.js';
import analytics from '#client/analytics/analytics.js';
import log from '#client/lib/log.js';
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
const useTransitionHook = ({ fetchPageData, allowedRoles, getMetadata } = {}) => {
  useScrollToTop();
  const state = useContext(StateContext);
  const isMounted = useIsMounted();
  const params = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // Block navigating elsewhere when data has been entered into the input
  useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname
  );

  const { isTransitioning, isNotFound, pageData } = useBranch({
    isTransitioning: ['isTransitioning'],
    isNotFound: ['isNotFound'],
    pageData: ['pageData'],
  });

  useEffect(() => {
    console.log('useEffect entry');
    state.push(['analytics', 'pathHistory'], location.pathname);

    // Skip the effect on the first render
    if (state.get('analytics', 'pathHistory').length !== 1) {
      console.log('TRANSITIONING START');
      state.set('isTransitioning', true);
      state.set('pageData', null);
      state.set('isNotFound', null);

      const isNotFound = () => {
        state.set('isNotFound', true);
      }

      // Fetch page data if fetchPageData function is provided, otherwise resolve immediately
      const fetchPageDataPromise = Promise.resolve(!fetchPageData
        ? null
        : fetchPageData({ dispatch, params, isNotFound })
      );

      if (fetchPageData) {
        state.commit({ force: true });
      }

      fetchPageDataPromise.then((newPageData) => {
        if (!isMounted()) {
          return;
        }
        state.set('pageData', newPageData || null);

        const pageMetadata = {
          ...(state.get('pageMetadataDefault') || {}),
          ...(!getMetadata ? {} : getMetadata({
            state: state,
            params,
          })),
        };

        setPageTitle(pageMetadata.pageTitle);

        state.set('pageMetadata', pageMetadata);
        state.set('isTransitioning', false);
        state.set('pendingCommit', false);
        state.set('isNotFound', false);

        state.commit();
      })
      .catch((error) => {
        log.error(error);

        if (isMounted()) {
          state.set('isTransitioning', false);
          state.set('pendingCommit', false);
          analytics.pageview();
          state.commit();
        }
      });
    }
    else {
      analytics.pageview();
    }

    return () => {
      console.log('TRANSITIONING START RETURN');
      state.set('isTransitioning', true);
      state.set('pageData', null);
      state.set('isNotFound', null);
      state.commit({ force: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  console.log(isTransitioning);

  return {
    pageData,
    isTransitioning,
    isNotFound,
  };
}

export default useTransitionHook;
