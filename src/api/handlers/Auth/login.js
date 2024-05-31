import jwt from 'jsonwebtoken';
import lodashOmit from 'lodash/fp/omit.js';
import lodashXor from 'lodash/fp/xor.js';

import {
  API_ERROR_INVALID_CREDENTIALS,
} from '#common/errorCodes.js';

import experimentsConfig from '#config/experiments.js';
import * as cookiesConfig from '#config/cookies.js';
import typeCheck from '#common/util/typeCheck.js';
import { getExperimentActiveVariants } from '#server/lib/experiments.js';
import User from '#models/User/index.js';

import {
  API_ACTION_LOGIN,
} from '#api/actionTypes.js';

const { JWT_KEY } = process.env;
const omitExperimentActiveVariants = lodashOmit('experimentActiveVariants');

export default {
  type: API_ACTION_LOGIN,
  validate({ phone, password, autoLoginToken }) {
    if (!autoLoginToken) {
      typeCheck('phone::Phone', phone);
      typeCheck('password::NonEmptyString', password);
    }
    else {
      typeCheck('autoLoginToken::NonEmptyString', autoLoginToken);
    }
  },
  async handler({ payload: { phone, password, autoLoginToken }, getCookie, setCookie }) {
    let userId;
    if (!autoLoginToken) {
      // Check if the login credentials are correct.
      const isValidLoginResults = await User.isValidLogin({ phone, password });

      if (!isValidLoginResults.success) {
        const error = new Error('Invalid username/password.');
        error.name = API_ERROR_INVALID_CREDENTIALS;
        error.details = isValidLoginResults;
        throw error;
      }
      userId = isValidLoginResults.userId;
    }
    else {
      const user = await User
        .first('*')
        .where('autoLoginToken', autoLoginToken);

      if (!user) {
        const error = new Error(`User with auto-login token ${autoLoginToken} not found.`);
        error.name = 'UserLoginTokenNotFoundError';
        throw error;
      }

      userId = user.id;
    }

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
    const userSessionJwtToken = jwt.sign(userSession, JWT_KEY);

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
      await User.update({ experimentActiveVariants }).where({ id: user.id });
    }

    return {
      user: omitExperimentActiveVariants(user),
      experimentActiveVariants: experimentActiveVariants,
    };
  },
};
