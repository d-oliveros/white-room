import assert from 'assert';
import jwt from 'jsonwebtoken';

import typeCheck from '#common/util/typeCheck.js';
import User from '#server/models/User/index.js';

import {
  API_ACTION_RESET_PASSWORD,
} from '#api/actionTypes';

const { JWT_KEY } = process.env;

export default {
  type: API_ACTION_RESET_PASSWORD,
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
