import { match } from 'react-router';
import assert from 'http-assert';
import invariant from 'invariant';
import analytics from '../lib/analytics';
import log from '../lib/log';
import routes from '../routes';
import fetchPageData from './fetchPageData';

const debug = log.debug('transitionHook');

/**
 * Creates a transition hook that will load the next page's data,
 * set the metadata, track a page view, changes the page's title, etc.
 *
 * This transition hook function is meant to be used with React Router.
 *
 * @param  {Object}  state  The application's state
 * @return {Function}       The transition hook
 */
export default function createTransitionHook(state) {
  invariant(process.browser, 'Only browsers can create transition hooks');


  let currentPathname = global.location ? global.location.pathname : null;

  return (nextState, callback) => {
    const location = nextState.pathname;
    const pathnameChanged = currentPathname !== location;

    if (!pathnameChanged) {
      debug('Path did not change');
      return callback();
    }

    assert(location, 409, 'Location is required');

    // Avoid re-rendering components if we're transitioning out of this page
    state.set('transitioning', true);

    // gets the next page's component branch
    match({ routes, location }, async (err, redirectLocation, renderProps) => {
      try {
        if (err) throw (err);

        assert(renderProps, 400, `No renderProps was generated for ${location}`);

        // fetches the next page's data
        debug('Fetching page data');
        await fetchPageData(renderProps, state);

        // change the page title
        const pageTitle = state.get('pageMetadata', 'title') || 'Boilerplate';
        setPageTitle(pageTitle);

        // track a page view
        analytics.pageview();

        currentPathname = location;
        state.set('transitioning', false);

        // handle pending state commits
        if (state.get('pendingCommit')) {
          state.set('pendingCommit', false);
          // state.commit();
        }

        debug('Resolving');

        callback();

      } catch (err) {
        log.error(err);
        global.location.href = '/404';
      }
    });
  };
}

/**
 * Changes the page title HTML tag.
 * @param {String}  title  The new title to set.
 */
function setPageTitle(title) {
  document.querySelector('head title').innerHTML = title;
}
