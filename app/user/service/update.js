import typeCheck from '#whiteroom/util/typeCheck.js';

import {
  ROLE_ADMIN,
  ROLE_USER,
} from '#user/constants/roles.js';

import { summaryFieldgroup } from '#user/model/userModel.js';
import User from '#user/model/userRepository.js';

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
