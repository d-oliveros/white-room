import assert from 'assert';
import lodashXor from 'lodash/fp/xor.js';
import User from '#models/User/index.js';
import typeCheck from '#common/util/typeCheck.js';

import {
  API_ACTION_CHECK_LOGIN_EXIST,
} from '#api/actionTypes.js';

export default {
  type: API_ACTION_CHECK_LOGIN_EXIST,
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
