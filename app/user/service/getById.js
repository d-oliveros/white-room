import typeCheck from '#white-room/util/typeCheck.js';
import {
  API_ERROR_NOT_ALLOWED,
} from '#white-room/constants/errorCodes.js';

import {
  USER_ROLE_ADMIN,
  USER_ROLE_USER,
  hasRoleAdmin,
} from '#user/constants/userRoles.js';

import User from '#user/model/userRepository.js';

export default {
  path: '/user/getById',
  roles: [
    USER_ROLE_ADMIN,
    USER_ROLE_USER,
  ],
  validate({ userId, fieldgroup }) {
    typeCheck('userId::PositiveNumber', userId);
    typeCheck('fieldgroup::Maybe NonEmptyArray', fieldgroup);
  },
  handler({ session, payload: { userId, fieldgroup } }) {
    if (!hasRoleAdmin(session.roles) && session.userId !== userId) {
      const error = new Error('Permission denied.');
      error.name = API_ERROR_NOT_ALLOWED;
      error.details = {
        session,
        userId,
      };
      throw error;
    }
    return User.getById(userId, fieldgroup);
  },
};
