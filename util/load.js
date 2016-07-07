/* eslint-disable no-var */
/* eslint-disable vars-on-top */

// Registers babel
require('babel-register');
require('babel-polyfill');
require('./loadenv');

global.__config = require('../config');
global.__log = require('../src/server/lib/logger').default;

var fs = require('fs');
var scriptName = process.argv[2];

if (!scriptName) {
  console.log('Script name is required.\nTry "npm run script [scriptName]".\n\n');
  console.log('Available scripts:\n' + getScriptNames(__dirname));
  process.exit(0);
}

var mod = require(`./${process.argv[2]}`);

if (typeof mod === 'object' && typeof mod.default === 'function') {
  mod = mod.default;
}

if (typeof mod === 'function') {
  var ret = mod((err) => {
    if (err) throw err;
    finish();
  });

  if (ret && typeof ret === 'object' && ret !== null && typeof ret.then === 'function') {
    ret.then(finish).catch((err) => {
      console.error(err.stack);
      throw err;
    });
  }
}

function finish() {
  console.log('Finished.');
  process.exit(0);
}

/**
 * Gets the files in dirname, without the file extension
 * and excluding this file
 * @param  {String} dirname Dir to get the script names from
 * @return {[type]}         [description]
 */
function getScriptNames(dirname) {
  return fs
    .readdirSync(dirname)
    .filter((filename) => filename !== 'load.js')
    .map((filename) => filename.replace(/\.js/, '') + '\n')
    .join('');
}
