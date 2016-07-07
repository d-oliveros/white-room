import inspect from 'util-inspect';
import assert from 'http-assert';
import { log } from '../lib';

const debug = log.debug('fetchPageData');

/**
 * Runs the data fetching functions defined in the router state's component tree.
 *
 * @param  {Object}  routerState  The router's state to take the components from.
 * @param  {state}   state        The application's state.
 * @return {Promise}              A promise that will be resolved when all the
 *                                data has been fetched.
 */
export default async function fetchPageData(routerState, tree) {
  assert(routerState, 400, 'Router state is required');
  assert(routerState.routes, 400, 'Router state does not have routes');
  debug(`Fetching component data. Routes is:\n${inspect(routerState.routes)}`);

  const components = routerState.routes.map(route => route.component);

  await Promise.all(fetchComponentsData(components, routerState, tree));
  setComponentsMeta(components, tree);
}

/**
 * Run each component's fetchData static method.
 *
 * @param   {Array}   components   An array of components to be rendered
 * @param   {Object}  routerState  The current state of the router
 * @param   {Object}  tree         The application's state
 * @returns {Array}                An array of promises
 */
function fetchComponentsData(components, routerState, tree) {

  debug(`Components are:\n${inspect(components)}`);

  const fetchDataPromises = components
    .filter(component => component.fetchData)
    .map(component => component.fetchData(routerState, tree));

  debug('fetchDataPromises is', fetchDataPromises);

  return fetchDataPromises;
}

/**
 * Changes the state's metadata object
 *
 * @param  {Array}   components   An array of components to be rendered
 * @param  {Object}  tree         The application's state
 */
function setComponentsMeta(components, tree) {
  const metadataGetters = components
    .filter(component => component.getPageMetadata)
    .map(component => component.getPageMetadata);

  debug('metadataGetters are', metadataGetters);

  metadataGetters.forEach((metadataGetter) => {
    const pageMetadata = metadataGetter(tree);

    if (typeof pageMetadata === 'object') {
      tree.set('pageMetadata', pageMetadata);
    }
  });
}
