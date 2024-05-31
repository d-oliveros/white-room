import jwt from 'jsonwebtoken';

import typeCheck from '#common/util/typeCheck.js';
import User from '#models/User/index.js';

import {
  API_ERROR_INVALID_CREDENTIALS,
} from '#common/errorCodes.js';

import {
  API_ACTION_GENERATE_RESET_PASSWORD_TOKEN,
} from '#api/actionTypes.js';

const { JWT_KEY } = process.env;

export default {
  type: API_ACTION_GENERATE_RESET_PASSWORD_TOKEN,
  validate({ phone }) {
    typeCheck('phone::Phone', phone);
  },
  async handler({ payload: { phone } }) {
    const user = await User.first(['id']).where({ phone });
    if (!user) {
      const error = new Error('User not found.');
      error.name = API_ERROR_INVALID_CREDENTIALS;
      error.details = {
        phone,
      };
      throw error;
    }

    const resetPasswordJwt = jwt.sign({ userId: user.id }, JWT_KEY, {
      expiresIn: '14d',
    });

    return resetPasswordJwt;
  },
};
