require('../_initEnv');
const path = require('path');

const seedFile = process.argv[3];

let mod = require(path.resolve('./migrations/seeds/e2e', seedFile)); // eslint-disable-line import/no-dynamic-require

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
  process.exit(0);
}
