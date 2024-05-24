const useBuild = process.env.USE_BUILD === 'true';

// Marks the project's source root dir.
const path = require('path');
require('app-module-path').addPath(path.join(__dirname, useBuild ? 'lib' : 'src'));

// Registers babel.
if (!useBuild) {
  require('@babel/register');
}

// Disables debug lib when the app is running the E2E tests
if (process.env.CIRCLECI) {
  require('debug').disable();
}

// Enabled TLS 1.0.
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';

// Loads the default environmental variables.
require('./util/loadenv');

/**
 * Define global variables.
 */
global.__config = require('./config');

global.__log = require(`./${useBuild ? 'lib' : 'src'}/server/lib/logger`).default; // eslint-disable-line import/no-dynamic-require
