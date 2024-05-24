import jwt from 'jsonwebtoken';
import lodashPick from 'lodash/fp/pick';

import { USER_ROLE_USER } from 'common/userRoles';
import typeCheck from 'common/util/typeCheck';

import User from 'server/models/User';

import {
  API_ACTION_SIGNUP,
} from 'api/actionTypes';

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
      lastVisitDate: new Date().toISOString(),
    };

    if (requestIp) {
      userSignupData.signupIp = requestIp;
    }
    else {
      __log.warn(`[api:Auth:signup] Warning: No signup IP available for ${payload.phone}.`);
    }

    const user = await User.signup(userSignupData);
    if (user) {
      const userSession = {
        userId: user.id,
        roles: user.roles,
      };
      const userSessionJwtToken = jwt.sign(userSession, JWT_KEY);

      setCookie(
        __config.cookies.session.name,
        userSessionJwtToken,
        __config.cookies.session.settings,
      );

      __log.info(`User signed up: ${userSignupData.phone}`);
    }

    return {
      user: user ? lodashPick(User.fieldgroups.summaryFieldgroup, user) : null,
    };
  },
};
