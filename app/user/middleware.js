import lodashXor from 'lodash/fp/xor.js';

// TODO: Detach experiments config.
import experimentsConfig from '#whiteroom/config/experiments.js';
import * as cookiesConfig from '#whiteroom/config/cookies.js';
import jwtSign from '#whiteroom/util/jwtSign.js';
import objectIsEqual from '#whiteroom/util/objectIsEqual.js';
import omitExperimentActiveVariants from '#whiteroom/util/omitExperimentActiveVariants.js';
import { getExperimentActiveVariants } from '#whiteroom/server/lib/experiments.js';

import User from '#user/model/userRepository.js';

// TODO: Throw error if `next` is not called().
export default (app) => {
  app.use(async (req, res, next) => {
    try {
      let user;
      const { session, initialState } = res.locals;

      // Load user data from session user ID.
      if (session && session.userId) {
        const { userId } = session;
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
            const userSessionJwtToken = jwtSign({
              userId: user.id,
              roles: user.roles,
            });

            res.cookie(
              cookiesConfig.session.name,
              userSessionJwtToken,
              cookiesConfig.session.settings
            );
            await User.update('shouldRefreshRoles', false).where('id', user.id);
          }

          initialState.currentUser = {
            ...(initialState.currentUser || {}),
            ...omitExperimentActiveVariants(user),
          };
        }
      }
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
        isCrawler: initialState.client.analytics.userAgent.isCrawler || false,
      });

      initialState.client.analytics.experiments.activeVariants = experimentActiveVariants;
      initialState.client.analytics.experiments.config = experimentsConfig;

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

      if (user) {
        const now = Date.now();
        let lastVisit = user.lastVisitAt
          ? user.lastVisitAt.getTime()
          : isNaN(req.cookies[cookiesConfig.lastVisit.name])
            ? null
            : req.cookies[cookiesConfig.lastVisit.name];

        if (!lastVisit || ((now - lastVisit) / 60000) >= 30) {
          initialState.client.analytics.shouldTrackNewSession = true;
        }

        await User.trackUserVisit({
          id: user.id,
          increaseSessionCount: initialState.client.analytics.shouldTrackNewSession,
        });

        if (initialState.client.analytics.shouldTrackNewSession) {
          initialState.currentUser.sessionCount += 1;
        }
      }
      next();
    }
    catch (error) {
      next(error);
    }
  });
}
