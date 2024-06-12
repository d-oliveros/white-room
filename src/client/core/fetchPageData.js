import { serializeError } from 'serialize-error';
import log from '#client/lib/log.js';

/**
 * Runs the data fetching functions defined in the router state's component tree.
 */
export default async function fetchPageData(branch, inject) {
  await Promise.all(fetchComponentsData(branch, inject));
  setComponentsMeta(branch, inject);
}

/**
 * Run each component's fetchData static method.
 *
 * @param   {Array}  branch An array of components to be rendered.
 * @param   {Object} inject The application's state.
 * @returns {Array}         An array of promises.
 */
function fetchComponentsData(branch, inject) {
  return branch
    .filter(({ route }) => route.component?.fetchData)
    .map(({ route, match }) => route.component.fetchData(match, inject));
}

/**
 * Changes the state's metadata object
 *
 * @param  {Array}  branch An array of components to be rendered.
 * @param  {Object} inject The application's state.
 */
function setComponentsMeta(branch, inject) {
  return branch
    .filter(({ route }) => route.component?.getPageMetadata)
    .forEach(({ route, match }) => {
      let pageMetadata;
      try {
        pageMetadata = route.component.getPageMetadata(inject.state, match);
      }
      catch (metadataGetterError) {
        const error = new Error(`Error while generating page metatags: ${metadataGetterError.message}`);
        error.name = 'PageMetadataGenerationError';
        error.details = {
          state: inject.state.get(),
          stringifiedMetadataGetterFunction: route.component.getPageMetadata.toString(),
        };
        error.inner = serializeError(metadataGetterError);
        log.error(error);
      }

      if (typeof pageMetadata === 'object') {
        inject.state.set('pageMetadata', pageMetadata);
      }
    });
}
