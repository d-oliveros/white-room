import typeCheck from 'common/util/typeCheck';
import {
  API_ERROR_NOT_ALLOWED,
} from 'common/errorCodes';

import {
  USER_ROLE_ADMIN,
  USER_ROLE_USER,
  hasRoleAdmin,
} from 'common/userRoles';

import User from 'server/models/User';

import {
  API_ACTION_USER_GET_BY_ID,
} from 'api/actionTypes';

export default {
  type: API_ACTION_USER_GET_BY_ID,
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
