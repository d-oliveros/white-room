let ctx;

try {
  ctx = require.context(__dirname, true, /^(.*\.js$)[^.]*$/im);
}
catch (err) {} // eslint-disable-line no-empty

module.exports = require('es6-requireindex')(ctx, { recursive: false });
