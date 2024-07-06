import typeCheck from '#white-room/util/typeCheck.js';

import {
  USER_ROLE_ADMIN,
  USER_ROLE_USER,
} from '#user/constants/userRoles.js';

import User from '#user/model/userRepository.js';

export default {
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
