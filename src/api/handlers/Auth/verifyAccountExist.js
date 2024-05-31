import typeCheck from '#common/util/typeCheck.js';

import {
  API_ACTION_VERIFY_ACCOUNT_EXIST,
} from '#api/actionTypes';
import User from '#server/models/User/index.js';

export default {
  type: API_ACTION_VERIFY_ACCOUNT_EXIST,
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
