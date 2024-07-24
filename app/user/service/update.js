import typeCheck from '#white-room/util/typeCheck.js';

import {
  ROLE_ADMIN,
  ROLE_USER,
} from '#user/constants/roles.js';

import User, { summaryFieldgroup } from '#user/model/user.js';

export default {
  roles: [
    ROLE_ADMIN,
    ROLE_USER,
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
      .returning(summaryFieldgroup);

    return updatedUser;
  },
};
