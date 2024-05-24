import typeCheck from 'common/util/typeCheck';

import {
  USER_ROLE_ADMIN,
  USER_ROLE_USER,
} from 'common/userRoles';

import {
  API_ACTION_USER_UPDATE,
} from 'api/actionTypes';

import User from 'server/models/User';

export default {
  type: API_ACTION_USER_UPDATE,
  roles: [
    USER_ROLE_ADMIN,
    USER_ROLE_USER,
  ],
  validate({ userUpdates }) {
    typeCheck('userUpdates::NonEmptyObject', userUpdates);
    if ('moveInDate' in userUpdates) {
      typeCheck('moveInDate::NonEmptyString', userUpdates.moveInDate);
    }
  },
  async handler({ session: { userId }, payload: { userUpdates } }) {
    const [updatedUser] = await User
      .update(userUpdates)
      .where({ id: userId })
      .returning(User.fieldgroups.summary);

    return updatedUser;
  },
};
