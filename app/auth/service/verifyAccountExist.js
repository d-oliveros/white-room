import typeCheck from '#white-room/util/typeCheck.js';

import User from '#user/model/userRepository.js';

export default {
  validate({ phone }) {
    typeCheck('phone::Phone', phone);
  },
  async handler({ payload: { phone } }) {
    const user = await User
      .where('phone', phone)
      .first();

    return !!user;
  },
};
