import '../src/server/modules/db';
import { User } from '../src/server/models';

let adminUser = {
  name: 'Admin',
  path: 'admin-page',
  email: 'hello@wiselike.com',
  password: 'admin',
  roles: {
    admin: true
  }
};

/**
 * This is an example script.
 *
 * To run: 'npm run script create-admin'
 * Feel free to remove it or just remove this comment if you wish to keep it.
 */
export default async function createAdmin() {
  let count = await User.count({ email: 'hello@wiselike.com' }).exec();
  if (count) {
    __log.warn('Admin user already exists!\n\nEmail: hello@wiselike.com\nDefault Password: admin');
  }

  await User.create(adminUser);
  __log.info('Admin user created. Email: hello@wiselike.com, Password: admin');
}
