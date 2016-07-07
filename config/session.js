var keygrip = require('keygrip');
var env = require('./env');

module.exports = {
  keys:        keygrip(process.env.SECRET_KEYS.split(',')),
  name:        'boilerplate::session',
  secureProxy: env === 'production',
  secure:      false,
  overwrite:   true,
  signed:      true,
  httpOnly:    false
};
