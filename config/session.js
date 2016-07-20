var keygrip = require('keygrip');
var env = process.env;

module.exports = {
  keys:        keygrip(env.SECRET_KEYS.split(',')),
  name:        'boilerplate::session',
  secureProxy: env.NODE_ENV === 'production',
  secure:      false,
  overwrite:   true,
  signed:      true,
  httpOnly:    false
};
