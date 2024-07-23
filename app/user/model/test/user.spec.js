import { assert, describe, it } from 'vitest';
import User from '#user/model/userRepository.js';

describe('User', () => {
  describe('trackUserVisit', () => {
    it('should update the user\'s session counts by 1 and return user data', async () => {
      const user1 = await User.first(['id', 'sessionCount']);
      const initialSessionCount = user1.sessionCount;

      const user2 = await User.trackUserVisit({ id: user1.id, increaseSessionCount: true });
      assert.equal(user2.id, user1.id);

      const user3 = await User.first(['sessionCount']).where({ id: user2.id });
      assert.equal(user3.sessionCount, initialSessionCount + 1);
    });
  });
});
