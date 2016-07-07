import SlugFactory from 'slug-factory';
import { promisify } from 'bluebird';

const slugFactory = promisify(SlugFactory);

export default async function generatePath(title) {
  const iterator = (path, cb) => this.count({ path }, cb);
  return await slugFactory(title, iterator);
}
