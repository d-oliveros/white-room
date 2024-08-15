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
  validate(user) {
    typeCheck('firstName::NonEmptyString', user.firstName);
    typeCheck('lastName::NonEmptyString', user.lastName);
    typeCheck('email::Email', user.email);
    typeCheck('phone::Maybe Phone', user.phone);
    typeCheck('analyticsSessionId::Maybe NonEmptyString', user.analyticsSessionId);
    typeCheck('password::NonEmptyString', user.password);
    typeCheck('experimentActiveVariants::Maybe Object', user.experimentActiveVariants);
  },
  async handler({ requestIp, setCookie, payload: {
    firstName,
    lastName,
    email,
    phone,
    analyticsSessionId,
    password,
    experimentActiveVariants,
  } }) {
    const userSignupData = {
      firstName,
      lastName,
      email,
      phone,
      signupAnalyticsSessionId: analyticsSessionId,
      experimentActiveVariants,
      signupProvider: 'email',
      roles: [
        ROLE_USER,
      ],
      lastVisitAt: new Date().toISOString(),
      signupIp: requestIp || null,
    };

    const { user, error } = await User.signup({
      ...userSignupData,
      password,
    });

    if (error) {
      return {
        user: null,
        error,
      };
    }

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
      error: null,
    };
  },
};
