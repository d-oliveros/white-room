import fs from 'fs';
import logger from '#common/logger.js';

const scriptName = process.argv[2];

if (!scriptName) {
  logger.error('Script name is required.\nTry "npm run script [scriptName]".\n\n');
  logger.info('Available scripts:\n' + getScriptNames(new URL('.', import.meta.url).pathname));
  process.exit(0);
}

import(`./${process.argv[2]}.js`).then((mod) => {
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
        logger.error(err);
        process.exit(1);
      });
    }
  }
}).catch((err) => {
  logger.error(err);
  process.exit(1);
});

function finish() {
  logger.info(`Finished "${scriptName}"`);
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
