const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const debug = require('debug')('loadenv');

const rootdir = path.resolve(__dirname, '..');

// loads the environment defined in the `.env` and `.env.default` files
try {
  fs.statSync('.env');
  debug('Loading env config');
  dotenv.config({ path: path.join(rootdir, '.env') });
}
catch (e) { // eslint-disable-line no-empty
}

dotenv.config({ path: path.join(rootdir, '.env.default') });
