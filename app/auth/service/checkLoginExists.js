import assert from 'assert';
import lodashXor from 'lodash/fp/xor.js';

import typeCheck from '#whiteroom/util/typeCheck.js';
import User from '#user/model/userRepository.js';

export default {
  validate({ phone, email }) {
    typeCheck('phone::Maybe Phone', phone);
    typeCheck('email::Maybe Email', email);
    assert(lodashXor(!!phone, !!email), 'One of `phone` or `email` is required, but not both.');
  },
  async handler({ payload: { phone, email } }) {
    const user = await User
      .first(['id', 'signupProvider'])
      .where(phone ? { phone } : { email });

    return {
      phone: phone,
      exists: !!user,
      signupProvider: user ? user.signupProvider : null,
    };
  },
};
