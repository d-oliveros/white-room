import jwt from 'jsonwebtoken';

import typeCheck from '#whiteroom/util/typeCheck.js';
import User from '#user/model/userRepository.js';

const { JWT_KEY } = process.env;

export default {
  validate({ phone }) {
    typeCheck('phone::Phone', phone);
  },
  async handler({ payload: { phone } }) {
    const user = await User.first(['id']).where({ phone });
    if (!user) {
      const error = new Error('User not found.');
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
