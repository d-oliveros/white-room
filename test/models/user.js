import '../testGlobals';
import moment from 'moment';
import { expect } from 'chai';
import { User } from '../../src/server/models';
import { userFixtures } from '../fixtures';
import { clearDatabase, createUsers } from '../util';

describe('User', () => {
  before(async () => {
    await clearDatabase();
    await createUsers();
  });

  describe('generateNextDriverSubscription', () => {
    it('should generate the next driver subscription', async () => {
      const user = userFixtures[0];
      const min = moment().add(12, 'hours').toDate();
      const max = moment().add(72, 'hours').toDate();

      await User.generateNextDriverSubscription(user._id);
      const userDoc = await User.findById(user._id).exec();
      const isBetween = moment(userDoc.driverSubscription.next).isBetween(min, max);
      expect(isBetween).equal(true);
    });
  });
});
