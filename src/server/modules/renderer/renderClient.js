import fs from 'fs';
import path from 'path';
import jsesc from 'jsesc';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { pick, defaults } from 'lodash';
import { match } from 'react-router';
import promisify from 'es6-promisify';
import handlebars from 'handlebars';
import createError from 'http-errors';
import pkg from '../../../../package.json';
import routes from '../../../client/routes';
import clientInitialState from '../../../client/initialState';
import createTree from '../../../client/lib/tree';
import fetchPageData from '../../../client/core/fetchPageData';
import Root from '../../../client/core/Root';

const buildHtml = handlebars.compile(getTemplateFile());
const matchAsync = promisify(match, { multiArgs: true });

const useBuild = __config.server.useBuild;
const initialStateKeys = Object.keys(clientInitialState());
const debug = __log.debug('whiteroom:renderer');

const defaultMetas = {
  pageTitle: 'White Room',
  image: 'https://someimagehost.com/images/default-page-image.jpg'
};

/**
 * Renders the client on server-side.
 *
 * Gets the initial state from req.body, makes the inital client render,
 * builds and returns the fully-rendered html.
 *
 * @param  {Object} options.state Initial client state.
 * @param  {String} options.url   Requested URL.
 * @return {String}               Fully-rendered HTML page.
 */
export default async function renderClient({ state, url }) {
  state = Object.assign(clientInitialState(), state || {});

  // instanciates the client's state tree
  const tree = createTree(state, {
    asynchronous: false,
    autocommit: false,
    immutable: false
  });

  const now = Date.now();
  debug(`Rendering client. Url: ${url}`);

  try {
    // get the component tree from the matching routes
    const [, componentBranch] = await matchAsync({ routes, location: url });
    if (!componentBranch) throw createError(404);

    // load this page's data into the tree
    await fetchPageData(componentBranch, tree);

    // instanciate the react application
    const rootedApp = <Root tree={tree} componentBranch={componentBranch}/>;

    // serializes the application to HTML
    const body = ReactDOMServer.renderToString(rootedApp);

    // builds the full page's HTML
    const html = buildHtml({
      body,
      useBuild,
      host: process.env.APP_HOST,
      meta: defaults(tree.get('meta') || {}, defaultMetas),
      segmentKey: process.env.SEGMENT_KEY,
      facebookPixelID: process.env.FACEBOOK_PIXEL_ID,
      serializedState: serializeState(tree),
      productionBundleSrc: useBuild ? `/dist/app.min-v${pkg.version}.js` : null,
      productionStyleSrc: useBuild ? `/dist/app.min-v${pkg.version}.css` : null
    });

    debug(`Rendered in ${Date.now() - now}ms - HTML length: ${html.length}`);

    tree.release();

    return html;

  } catch (err) {
    tree.release();
    throw err;
  }
}

// Reads the layout file
function getTemplateFile() {
  const CLIENT_ROOT = path.resolve(__dirname, '..', '..', '..', 'client');
  const source = path.resolve(CLIENT_ROOT, 'layout.hbs');
  return fs.readFileSync(source, { encoding: 'utf-8' });
}

// Serializes the state
function serializeState(state) {
  const keys = initialStateKeys.filter((name) => name[0] !== '$');

  state = pick(state.get(), ...keys);

  return jsesc(JSON.stringify(state));
}
