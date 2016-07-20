import assert from 'http-assert';
import { isObject, isString } from 'lodash';
import { isEmail } from 'cd-common';
import { User } from '../../models';
import { getRequestIP } from '../../lib/geocoder';
import { generateToken } from '../../modules/auth/token';

const debug = __log.debug('whiteroom:Auth');

export default async function signup(params) {
  assert(isObject(params), 400);

  const { email, name } = params;
  assert(isEmail(email), 400, 'Email is not valid');
  assert(name && isString(name), 400, 'Name is not valid');

  if (this.xhr) {
    const ip = getRequestIP(this.req);
    params.signupIp = ip || undefined;
  }

  debug(`User signup with email: ${email}`, params);

  const user = await User.emailSignup(params);

  debug('creating user session');
  const userSession = user.createSession();
  const token = generateToken(userSession);

  if (this.xhr) {
    this.setCookie('token', token, __config.cookies);
  }

  return { user: userSession, token };
}
