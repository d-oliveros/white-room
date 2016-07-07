const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const debug = require('debug')('app:loadenv');
const appModulePath = require('app-module-path');

const rootdir = path.resolve(__dirname, '..');

// marks the project's source root dir
appModulePath.addPath(rootdir);

// loads the environment defined in the `.env` and `.env.default` files
try {
  fs.statSync('.env');
  debug('Loading env config');
  dotenv.load({ path: path.join(rootdir, '.env') });
} catch (e) {}

dotenv.load({ path: path.join(rootdir, '.env.default') });
