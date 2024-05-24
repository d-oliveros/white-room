require('../_initEnv');
const fs = require('fs');

const scriptName = process.argv[2];

if (!scriptName) {
  __log.error('Script name is required.\nTry "npm run script [scriptName]".\n\n');
  __log.info('Available scripts:\n' + getScriptNames(__dirname));
  process.exit(0);
}

let mod = require(`./${process.argv[2]}`); // eslint-disable-line import/no-dynamic-require

if (typeof mod === 'object' && typeof mod.default === 'function') {
  mod = mod.default;
}

if (typeof mod === 'function') {
  const ret = mod((err) => {
    if (err) throw err;
    finish();
  });

  if (ret && typeof ret === 'object' && ret !== null && typeof ret.then === 'function') {
    ret.then(finish).catch((err) => {
      __log.error(err);
      process.exit(1);
    });
  }
}

function finish() {
  __log.info(`Finished "${scriptName}"`);
  process.exit(0);
}

/**
 * Gets the files in dirname, without the file extension and excluding this file.
 *
 * @param  {String} dirname Dir to get the script names from.
 * @return {Array}  List of script names.
 */
function getScriptNames(dirname) {
  return fs
    .readdirSync(dirname)
    .filter((filename) => filename !== 'load.js')
    .map((filename) => filename.replace(/\.js/, '') + '\n')
    .join('');
}
