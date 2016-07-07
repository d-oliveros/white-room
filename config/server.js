var env = require('./env');

module.exports = {
  host: process.env.APP_HOST,
  port: process.env.APP_PORT || 3000,
  useBuild: env === 'production' || process.env.USE_BUILD === 'true'
};
