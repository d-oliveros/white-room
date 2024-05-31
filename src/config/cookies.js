import { parse } from 'url';

const {
  APP_URL,
} = process.env;

const defaultSettings = {
  maxAge: 60 * 60 * 24 * 150 * 1000, // 150 days in seconds
  host: parse(APP_URL).hostname,
  safe: true,
  httpOnly: true,
  path: '/',
};

export const session = {
  name: 'session-token',
  settings: defaultSettings,
};

export const lastVisit = {
  name: 'last-visit-timestamp',
  settings: defaultSettings,
};

export const analyticsSessionId = {
  name: 'analytics-session-id',
  settings: defaultSettings,
};

export const experimentActiveVariants = {
  name: 'experiment-active-variants',
  settings: defaultSettings,
};

export const utm = {
  name: 'utm',
  settings: defaultSettings,
};
