var env = process.env;

module.exports = {
  host: env.APP_HOST || '127.0.0.1',
  port: env.APP_PORT || 3000,
  useBuild: env.NODE_ENV === 'production' || env.USE_BUILD === 'true'
};
