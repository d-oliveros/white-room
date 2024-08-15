import assert from 'assert';
import jwt from 'jsonwebtoken';

import typeCheck from '#whiteroom/util/typeCheck.js';
import User from '#user/model/userRepository.js';

const { JWT_KEY } = process.env;

export default {
  validate({ token, password }) {
    typeCheck('token::NonEmptyString', token);
    typeCheck('password::NonEmptyString', password);
  },
  async handler({ payload: { token, password } }) {
    const tokenContents = await jwt.verify(token, JWT_KEY);
    assert(tokenContents, 'Token is not valid.');

    const userId = tokenContents.userId;

    const user = await User.updatePassword(userId, password);

    return { id: user.id, phone: user.phone };
  },
};
