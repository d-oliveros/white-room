const { defineConfig } = require('cypress'); // eslint-disable-line
const { APP_URL = 'http://localhost:3000' } = process.env;

module.exports = defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 8000,
  numTestsKeptInMemory: 1,
  pageLoadTimeout: 80000,
  video: false,
  trashAssetsBeforeRuns: true,
  reporter: 'junit',
  screenshotsFolder: 'test_results',
  reporterOptions: {
    mochaFile: 'cypress/test-results/result-output-[hash].xml',
    toConsole: true,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins')(on, config);
    },
    baseUrl: APP_URL,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});
