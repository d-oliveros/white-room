// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const webpack = require('@cypress/webpack-preprocessor'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = (on, config) => { // eslint-disable-line no-unused-vars
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const options = {
    webpackOptions: require('../../webpack.config'),
    watchOptions: {},
  };

  on('file:preprocessor', webpack(options));

  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--js-flags=--expose-gc');
      launchOptions.args.push('--disable-dev-shm-usage');
    }

    return launchOptions;
  });
};
