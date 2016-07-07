import assert from 'http-assert';
import { isEmail } from 'cd-common';
import { isObject, isString } from 'lodash';
import { User } from '../../models';
import { generateToken } from '../../modules/auth/token';

export default async function login(params) {
  assert(isObject(params) && isString(params.email), 400);

  const email = params.email.toLowerCase().trim();
  const password = params.password;

  assert(isEmail(email), 400, 'Email is not valid');

  const user = await User.findOne({ email });

  assert(user, 409, 'User not found');
  assert(user.password, 401, 'User has no email login access');

  const passwordIsValid = await user.comparePassword(password);

  assert(passwordIsValid, 401, 'Invalid password');

  const userSession = user.createSession();
  const token = generateToken(userSession);

  // sets the user token in a cookie
  this.setCookie('token', token, __config.cookies);

  // updates the user sessions count
  await User.update({ _id: user._id }, { $inc: { 'logs.sessions': 1 } });

  return { user: userSession, token };
}
