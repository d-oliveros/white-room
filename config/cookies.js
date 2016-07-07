var appHost = process.env.APP_HOST;
var appDomain = process.env.APP_DOMAIN;

// Ensures the app domain contains a "." as the initial character
if (appDomain && typeof appDomain === 'string' && appDomain[0] !== '.') {
  appDomain = '.' + appDomain;
}

module.exports = {
  maxAge: 60 * 60 * 24 * 150 * 1000, // 150 days in seconds
  host:   appHost,
  domain: appDomain,
  safe:   true,
  httpOnly: true,
  path:   '/'
};
