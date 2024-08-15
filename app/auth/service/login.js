import lodashXor from 'lodash/fp/xor.js';

import typeCheck from '#whiteroom/util/typeCheck.js';
import jwtSign from '#whiteroom/util/jwtSign.js';
import omitExperimentActiveVariants from '#whiteroom/util/omitExperimentActiveVariants.js';
import { getExperimentActiveVariants } from '#whiteroom/server/lib/experiments.js';
import User from '#user/model/userRepository.js';

import experimentsConfig from '#whiteroom/config/experiments.js';
import * as cookiesConfig from '#whiteroom/config/cookies.js';

export default {
  validate({ email, password }) {
    typeCheck('email::Email', email);
    typeCheck('password::NonEmptyString', password);
  },
  async handler({ payload: { email, password }, getCookie, setCookie }) {
    const isValidLoginResults = await User.isValidLogin({ email, password });

    if (!isValidLoginResults.success) {
      return {
        user: null,
        experimentActiveVariants: null,
        error: 'Invalid username/password.',
      };
    }

    const userId = isValidLoginResults.userId;

    // Load user data, track user session visit.
    await User.trackUserVisit({
      id: userId,
      increaseSessionCount: true,
    });

    const user = await User.getSession(userId);
    const userSession = {
      userId: user.id,
      roles: user.roles,
    };
    const userSessionJwtToken = jwtSign(userSession);

    // Sets the user token in a cookie.
    setCookie(
      cookiesConfig.session.name,
      userSessionJwtToken,
      cookiesConfig.session.settings
    );

    // Sets analytic experiment variants, persist in cookie.
    // WARN(@d-oliveros): Duplicate logic here and in /server/middleware/extractInitialState.
    const cookieExperimentActiveVariants = getCookie(cookiesConfig.experimentActiveVariants.name) || {};

    const userExperimentActiveVariants = user.experimentActiveVariants || {};

    const cookieAndUserHaveDifferentExperiments = lodashXor(
      Object.keys(userExperimentActiveVariants),
      Object.keys(cookieExperimentActiveVariants)
    ).length > 0;

    const prevExperimentActiveVariants = {
      ...cookieExperimentActiveVariants,
      ...userExperimentActiveVariants,
    };

    const { experimentActiveVariants, changed } = getExperimentActiveVariants({
      experimentsConfig,
      prevExperimentActiveVariants,
    });

    setCookie(
      cookiesConfig.experimentActiveVariants.name,
      experimentActiveVariants,
      cookiesConfig.experimentActiveVariants.settings,
    );

    if (changed || cookieAndUserHaveDifferentExperiments) {
      await User
        .update({ experimentActiveVariants })
        .where({ id: user.id });
    }

    return {
      user: omitExperimentActiveVariants(user),
      experimentActiveVariants: experimentActiveVariants,
      error: null,
    };
  },
};
