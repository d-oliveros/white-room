import typeCheck from '#white-room/util/typeCheck.js';

import User from '#user/model/userRepository.js';

export default {
  validate({ email }) {
    typeCheck('email::Email', email);
  },
  async handler({ payload: { email } }) {
    const user = await User
      .first('id')
      .where({ email })

    return !!user;
  },
};
