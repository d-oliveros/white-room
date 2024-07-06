import { v1 as uuidv1 } from 'uuid';
import UAParser from 'ua-parser-js';
import MobileDetect from 'mobile-detect';
import { isbot } from 'isbot';

import * as cookiesConfig from '#white-room/config/cookies.js';

import logger from '#white-room/logger.js';
import isUserAgentMobileApp from '#white-room/util/isUserAgentMobileApp.js';
import makeInitialState from '#white-room/client/makeInitialState.js';

const debug = logger.createDebug('renderer:makeInitialState');
const env = process.env;
const isAnalyticsEnabled = !!env.SEGMENT_KEY;

const extractUtmValuesFromExpressRequestQuery = (req) => {
  if (
    !req
    || !req.query
    || (
      !req.query.utm_source
      && !req.query.utm_medium
      && !req.query.utm_campaign
      && !req.query.utm_term
      && !req.query.utm_content
    )
  ) {
    return null;
  }

  const utmValues = {
    source: req.query.utm_source,
    medium: req.query.utm_medium,
    campaign: req.query.utm_campaign,
    term: req.query.utm_term,
    content: req.query.utm_content,
  };

  return utmValues;
}

const extractInitialStateMiddlewareFactory = ({ getAppState } = {}) => {
  return async (req, res, next) => {
    try {
      const initialState = makeInitialState();

      // Pass server environment variables.
      initialState.env = Object.keys(initialState.env).reduce((acc, envKey) => ({
        ...acc,
        [envKey]: env[envKey],
      }), {});

      // Get the current analytics session ID from cookies.
      let analyticsSessionId = req.cookies[cookiesConfig.analyticsSessionId.name];
      if (!analyticsSessionId) {
        analyticsSessionId = uuidv1();
        res.cookie(
          cookiesConfig.analyticsSessionId.name,
          analyticsSessionId,
          cookiesConfig.analyticsSessionId.settings,
        );
      }

      initialState.analytics.analyticsSessionId = analyticsSessionId;

      // Set UTM values
      let utmValues = extractUtmValuesFromExpressRequestQuery(req);
      let shouldUpdateUtmValuesInCookie = !!utmValues;

      if (!utmValues) {
        utmValues = req.cookies[cookiesConfig.utm.name];
        if (utmValues && typeof utmValues !== 'object') {
          res.clearCookie(cookiesConfig.utm.name, cookiesConfig.utm.settings);
          utmValues = null;
        }
      }

      if (utmValues) {
        // If a UTM parameter is specified in the URL twice, use the first value.
        const keysWithArrayValues = Object.keys(utmValues).filter((key) => {
          return Array.isArray(utmValues[key]);
        });
        keysWithArrayValues.forEach((key) => {
          utmValues[key] = utmValues[key][0];
        });

        if (!shouldUpdateUtmValuesInCookie) {
          // Update utm values in cookie if utm values object has been flattened.
          shouldUpdateUtmValuesInCookie = !!keysWithArrayValues.length;
        }

        if (shouldUpdateUtmValuesInCookie) {
          res.cookie(
            cookiesConfig.utm.name,
            utmValues,
            cookiesConfig.utm.options,
          );
        }
        initialState.analytics.utmValues = utmValues;
      }

      // Get device information from User Agent
      const uaParsed = new UAParser(req.headers['user-agent']).getResult();
      const mobileDetect = new MobileDetect(req.headers['user-agent']);
      initialState.analytics.userAgent = {
        browserName: uaParsed.browser.name,
        browserVersion: uaParsed.browser.version,
        deviceType: uaParsed.device.type,
        deviceVendor: uaParsed.device.vendor,
        deviceModel: uaParsed.device.model,
        engineName: uaParsed.engine.name,
        engineVersion: uaParsed.engine.version,
        osName: uaParsed.os.name,
        osVersion: uaParsed.os.version,
        cpuArchitecture: uaParsed.cpu.architecture,
        userAgentString: uaParsed.ua,
        isMobile: !!mobileDetect.phone(),
        isTablet: !!mobileDetect.tablet(),
        isBrowser: !mobileDetect.mobile() && !mobileDetect.tablet(),
        isCrawler: isbot(req.headers['user-agent']),
      };

      // Check if analytics is enabled.
      initialState.analytics.isEnabled = isAnalyticsEnabled;

      // Set IP and location in analytics store.
      const requestIp = req.ip;
      initialState.analytics.requestIp = requestIp;
      initialState.analytics.location = {};

      // Check if it is the mobile app.
      if (isUserAgentMobileApp(initialState.analytics.userAgent)) {
        initialState.mobileApp.isMobileApp = true;
      }

      // Check if we should track a new session on browserside, turns the "shouldTrackNewSession" flag on.
      const now = Date.now();
      let lastVisit = isNaN(req.cookies[cookiesConfig.lastVisit.name])
        ? null
        : req.cookies[cookiesConfig.lastVisit.name];

      if (!lastVisit || ((now - lastVisit) / 60000) >= 30) {
        initialState.analytics.shouldTrackNewSession = true;
      }

      debug('Extracted initial state from request');

      res.cookie(
        cookiesConfig.lastVisit.name,
        now,
        cookiesConfig.lastVisit.settings,
      );

      const initialClientState = await (getAppState
        ? getAppState(initialState)
        : {}
      );

      res.locals.initialState = {
        ...initialState,
        ...initialClientState,
      };

      next();
    }
    catch (err) {
      next(err);
      return err;
    }
  };
}

export default extractInitialStateMiddlewareFactory;
