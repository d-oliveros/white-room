import { userFixtures, adminFixture } from '../fixtures';
import { User } from '../../src/server/models';

export default async function createUsers() {
  return await Promise.all([
    User.create(userFixtures[0]),
    User.create(userFixtures[1]),
    User.create(userFixtures[2]),
    User.create(userFixtures[3]),
    User.create(userFixtures[4]),
    User.create(adminFixture)
  ]);
}
