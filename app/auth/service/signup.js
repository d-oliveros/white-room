import jwt from 'jsonwebtoken';
import lodashPick from 'lodash/fp/pick.js';

import * as cookiesConfig from '#white-room/config/cookies.js';
import logger from '#white-room/logger.js';
import { ROLE_USER } from '#user/constants/roles.js';
import typeCheck from '#white-room/util/typeCheck.js';

import User from '#user/model/userRepository.js';

const {
  JWT_KEY,
} = process.env;

export default {
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
        ROLE_USER,
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
