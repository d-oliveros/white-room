import jwt from 'jsonwebtoken';
import lodashPick from 'lodash/fp/pick.js';

import * as cookiesConfig from '#config/cookies.js';
import logger from '#common/logger.js';
import { USER_ROLE_USER } from '#common/userRoles.js';
import typeCheck from '#common/util/typeCheck.js';

import User from '#models/User/index.js';

import {
  API_ACTION_SIGNUP,
} from '#api/actionTypes.js';

const {
  JWT_KEY,
} = process.env;

export default {
  type: API_ACTION_SIGNUP,
  validate({ user }) {
    typeCheck('user::NonEmptyObject', user);
    typeCheck('userEmail::Email', user.email);
  },
  async handler({ payload, requestIp, setCookie }) {
    const userSignupData = {
      ...payload.user,
      email: payload.user.email
        ? payload.user.email.trim().toLowerCase()
        : undefined,
      signupProvider: 'email',
      roles: [
        USER_ROLE_USER,
      ],
      lastVisitAt: new Date().toISOString(),
    };

    if (requestIp) {
      userSignupData.signupIp = requestIp;
    }
    else {
      logger.warn(`[api:Auth:signup] Warning: No signup IP available for ${payload.phone}.`);
    }

    const user = await User.signup(userSignupData);
    if (user) {
      const userSession = {
        userId: user.id,
        roles: user.roles,
      };
      const userSessionJwtToken = jwt.sign(userSession, JWT_KEY);

      setCookie(
        cookiesConfig.session.name,
        userSessionJwtToken,
        cookiesConfig.session.settings,
      );

      logger.info(`User signed up: ${userSignupData.phone}`);
    }

    return {
      user: user ? lodashPick(User.fieldgroups.summaryFieldgroup, user) : null,
    };
  },
};
