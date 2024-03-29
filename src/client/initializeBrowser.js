import React from 'react';
import invariant from 'invariant';
import es6Promise from 'es6-promise';
import { render } from 'react-dom';
import { browserHistory } from 'react-router';
import toast from 'vanillatoasts';
import { isObject } from 'lodash';
import { AppContainer } from 'react-hot-loader';
import socketClient from './websockets/client';
import analytics from './lib/analytics';
import log from './lib/log';
import routes from './routes';
import getStateFromBrowser from './core/getStateFromBrowser';
import initDevelopmentEnv from './core/developmentEnv';
import createTransitionHook from './core/transitionHook';
import api from '../server/api';

/**
 * This is the entry file for the client application.
 * This file, when required, initializes the client in the browser.
 */
invariant(
  process.browser,
  'Only browsers are allowed to bootstrap the client');

// polyfills
es6Promise.polyfill();

// gets the serialized state injected by the server
// @see server/modules/renderer
const state = getStateFromBrowser();

// initializes the development environment
if (process.env.NODE_ENV !== 'production') {
  initDevelopmentEnv(state);
}

// connects the websockets client to the server
socketClient.init(state);

// configures the analytics lib
analytics.configure(state);

// adds API error handlers
api.addErrorHandler((err) => {
  if (isObject(err)) {
    const res = err.response;
    log.error(res);
    if (isObject(res) && res.body && res.body.message) {
      toast.create({
        title: res.body.message
      });
    }
  }
});

// scrolls to the top when transitioning pages
browserHistory.listen(({ action }) => {
  setTimeout(() => {
    if (action !== 'POP') {
      global.scrollTo(0, 0);
    }
  });
});

// registers a transition hook to be run when the URL changes
browserHistory.listenBefore(createTransitionHook(state));

// track site visit
const currentUser = state.get('currentUser');
const isAnonymous = currentUser.roles.anonymous;

if (!isAnonymous) {
  analytics.identify(currentUser);
}

if (state.get('trackSiteVisit')) {
  analytics.track(`${isAnonymous ? 'Anonymous' : 'User'}  Session`);
}

analytics.pageview();

// loads the application in the DOM
const containerNode = global.document.getElementById('react-container');

const renderAppInDOM = () => {
  const Root = require('./core/Root').default;

  const rootedApp = (
    <AppContainer>
      <Root tree={state} routes={routes} history={browserHistory}/>
    </AppContainer>
  );

  render(rootedApp, containerNode);
};

if (module.hot) {
  module.hot.accept('./core/Root', renderAppInDOM);
}

renderAppInDOM();
