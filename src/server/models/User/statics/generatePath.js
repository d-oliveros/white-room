import SlugFactory from 'slug-factory';
import createError from 'http-errors';
import { promisify } from 'bluebird';

const slugFactory = promisify(SlugFactory);

const reservedNames = [
  'admin',
  'password-reset',
  'isomorphine'
];

export default async function generatePath(name) {
  return await slugFactory(name, (path, cb) => {
    if (reservedNames.indexOf(path) > -1) {
      return cb(createError(400, 'Name is reserved.'));
    }

    this.count({ path }, cb);
  });
}
