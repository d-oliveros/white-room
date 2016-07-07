import {isArray, isPlainObject, map} from 'lodash';

export default function formatEmails(emails) {
  if (!isArray(emails)) {
    emails = [emails];
  }

  if (!isPlainObject(emails[0])) {
    emails = map(emails, (email) => {
      return { email };
    });
  }

  return emails;
}
