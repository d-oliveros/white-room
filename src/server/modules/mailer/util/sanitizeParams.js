import {clone, isString, isArray} from 'lodash';
import formatEmails from './formatEmails';

export default function sanitizeParams(params) {
  params = clone(params);

  if (isString(params)) {
    params = { email: params };
  }

  if (isString(params.email)) {
    params.emails = [params.email];
  }

  if (isArray(params)) {
    params = { emails: params };
  }

  params.emails = formatEmails(params.emails);

  return params;
}
