import jwt from 'jsonwebtoken';
import lodashPick from 'lodash/fp/pick.js';

import * as cookiesConfig from '#white-room/config/cookies.js';
import logger from '#white-room/logger.js';
import { ROLE_USER } from '#user/constants/roles.js';
import typeCheck from '#white-room/util/typeCheck.js';

import User from '#user/model/userRepository.js';
import { summaryFieldgroup } from '#user/model/userModel.js';

const {
  JWT_KEY,
} = process.env;

export default {
  validate({ user }) {
    typeCheck('user::NonEmptyObject', user);
    typeCheck('user::NonEmptyObject', user);
    typeCheck('user::NonEmptyObject', user);
    typeCheck('userEmail::Email', user.email);
  },
  async handler({ requestIp, setCookie, payload: { email, firstName, lastName } }) {
    const userSignupData = {
      email: email ? email.trim().toLowerCase() : null,
      firstName,
      lastName,
      signupProvider: 'email',
      roles: [
        ROLE_USER,
      ],
      lastVisitAt: new Date().toISOString(),
      signupIp: requestIp || null,
    };

    const user = await User.signup(userSignupData);

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

    logger.info(`User signed up: ${userSignupData.email}`);

    return {
      user: user ? lodashPick(summaryFieldgroup, user) : null,
    };
  },
};
