import typeCheck from '#whiteroom/util/typeCheck.js';
// import {
//   API_ERROR_NOT_ALLOWED,
// } from '#whiteroom/constants/errorCodes.js';

// import {
//   hasRoleAdmin,
// } from '#user/constants/roles.js';

import User from '#user/model/userRepository.js';

/*
import logger from '#whiteroom/logger.js';

const withRoles = ({ res }) => {
  try {
    return res.locals.session.roles.includes([
      ROLE_ADMIN,
      ROLE_USER,
    ]);
  }
  catch (innerError) {
    const error = new Error(`Error while authorizing: ${innerError.message}`, {
      cause: innerError,
    });
    error.name = innerError.name;
    logger.error(error);
    return false;
  }
}
*/

export default {
  path: '/user/getById',
  validate({ userId, fieldgroup }) {
    typeCheck('userId::PositiveNumber', userId);
    typeCheck('fieldgroup::Maybe NonEmptyArray', fieldgroup);
  },
  handler({ payload: { userId, fieldgroup } }) {
    // if (!hasRoleAdmin(session.roles) && session.userId !== userId) {
    //   const error = new Error('Permission denied.');
    //   error.name = API_ERROR_NOT_ALLOWED;
    //   error.details = {
    //     session,
    //     userId,
    //   };
    //   throw error;
    // }
    return User.getById(userId, fieldgroup);
  },
};
