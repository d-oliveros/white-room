const parseUrl = require('url').parse;

const { APP_URL } = process.env;

const defaultSettings = {
  maxAge: 60 * 60 * 24 * 150 * 1000, // 150 days in seconds
  host:   parseUrl(APP_URL).hostname,
  safe:   true,
  httpOnly: true,
  path:   '/',
};

exports.session = {
  name: 'session-token',
  settings: defaultSettings,
};

exports.lastVisit = {
  name: 'last-visit-timestamp',
  settings: defaultSettings,
};

exports.analyticsSessionId = {
  name: 'analytics-session-id',
  settings: defaultSettings,
};

exports.experimentActiveVariants = {
  name: 'experiment-active-variants',
  settings: defaultSettings,
};

exports.utm = {
  name: 'utm',
  settings: defaultSettings,
};
