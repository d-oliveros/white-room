import { v1 as uuidv1 } from 'uuid';
import UAParser from 'ua-parser-js';
import MobileDetect from 'mobile-detect';
import { isbot } from 'isbot';
import jwt from 'jsonwebtoken';
import lodashOmit from 'lodash/fp/omit.js';
import lodashXor from 'lodash/fp/xor.js';

import experimentsConfig from '#config/experiments.js';
import * as cookiesConfig from '#config/cookies.js';

import logger from '#common/logger.js';
import isUserAgentMobileApp from '#common/util/isUserAgentMobileApp.js';
import objectIsEqual from '#common/util/objectIsEqual.js';
import makeInitialState from '#client/makeInitialState.js';
import {
  getExperimentActiveVariants,
} from '#server/lib/experiments.js';
import User from '#models/User/index.js';

const debug = logger.createDebug('renderer:makeInitialState');
const env = process.env;
const isAnalyticsEnabled = !!env.SEGMENT_KEY;

const omitExperimentActiveVariants = lodashOmit('experimentActiveVariants');

function extractUtmValuesFromExpressRequestQuery(req) {
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

export default async function extractInitialStateMiddleware(req, res, next) {
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

    let user;

    // Load user data from session user ID.
    if (res.locals.session && res.locals.session.userId) {
      // HACK(@d-oliveros): This should be a fetchData action in the root HOC on the webapp.
      // WARNING: Duplicated user loading logic here and in actions/Auth/login.
      const { userId } = res.locals.session;
      const userSession = await User.getSession(userId);

      // If the user no longer exists in the DB, clear the session cookies.
      if (!userSession) {
        res.clearCookie(
          cookiesConfig.session.name,
          cookiesConfig.session.settings,
        );
      }
      else {
        user = userSession;

        if (user.shouldRefreshRoles) {
          const userSessionJwtToken = jwt.sign({
            userId: user.id,
            roles: user.roles,
          }, env.JWT_KEY);

          res.cookie(
            cookiesConfig.session.name,
            userSessionJwtToken,
            cookiesConfig.session.settings
          );
          await User.update('shouldRefreshRoles', false).where('id', user.id);
        }

        initialState.currentUser = {
          ...initialState.currentUser,
          ...omitExperimentActiveVariants(user),
        };
      }
    }

    // WARN: Duplicate logic here and in /api/handlers/Auth/login.
    const cookieExperimentActiveVariants = req.cookies[cookiesConfig.experimentActiveVariants.name] || {};
    const userExperimentActiveVariants = user ? user.experimentActiveVariants || {} : null;

    const cookieAndUserHaveDifferentExperiments = (
      userExperimentActiveVariants
      && cookieExperimentActiveVariants
      && (
        lodashXor(
          Object.keys(userExperimentActiveVariants),
          Object.keys(cookieExperimentActiveVariants)
        ).length > 0
      )
    );

    const prevExperimentActiveVariants = (userExperimentActiveVariants
      ? {
        ...cookieExperimentActiveVariants,
        ...userExperimentActiveVariants,
      }
      : cookieExperimentActiveVariants
    );

    // Sets analytic experiment variants, persist in application state and cookie.
    const { experimentActiveVariants, changed } = getExperimentActiveVariants({
      experimentsConfig: experimentsConfig,
      prevExperimentActiveVariants: prevExperimentActiveVariants,
      isCrawler: initialState.analytics.userAgent.isCrawler,
    });

    initialState.analytics.experiments.activeVariants = experimentActiveVariants;
    initialState.analytics.experiments.config = experimentsConfig;

    const shouldUpdateCookie = (
      changed
      || cookieAndUserHaveDifferentExperiments
      || (
        user
        && (
          !userExperimentActiveVariants
          || (
            !objectIsEqual(
              userExperimentActiveVariants,
              req.cookies[cookiesConfig.experimentActiveVariants.name],
            )
          )
        )
      )
    );

    const shouldUpdateDbExperimentActiveVariants = (
      (changed || cookieAndUserHaveDifferentExperiments)
      && !!user
    );

    if (shouldUpdateCookie) {
      res.cookie(
        cookiesConfig.experimentActiveVariants.name,
        experimentActiveVariants,
        cookiesConfig.experimentActiveVariants.settings,
      );
    }

    if (shouldUpdateDbExperimentActiveVariants) {
      await User.update({ experimentActiveVariants }).where({ id: user.id });
    }

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

    // If the user is logged in, use the value in `user.lastVisitAt`
    if (initialState.currentUser.lastVisitAt) {
      lastVisit = initialState.currentUser.lastVisitAt.getTime();
    }

    if (!lastVisit || ((now - lastVisit) / 60000) >= 30) {
      initialState.analytics.shouldTrackNewSession = true;
    }

    if (user) {
      await User.trackUserVisit({
        id: user.id,
        increaseSessionCount: initialState.analytics.shouldTrackNewSession,
      });

      if (initialState.analytics.shouldTrackNewSession) {
        initialState.currentUser.sessionCount += 1;
      }
    }

    debug(`Extracted initial state from request - ${JSON.stringify({
      lastVisit: lastVisit,
      isLoggedIn: !!initialState.currentUser.id,
      isNewSession: initialState.analytics.shouldTrackNewSession,
    })}`);

    res.cookie(
      cookiesConfig.lastVisit.name,
      now,
      cookiesConfig.lastVisit.settings,
    );

    res.locals.initialState = initialState;

    next();
  }
  catch (err) {
    next(err);
    return err;
  }
}
