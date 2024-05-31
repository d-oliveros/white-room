import { assert } from 'chai';
import { v4 as uuidv4 } from 'uuid';

import User from '#models/User/index.js';
import usersFixture from '../../migrations/seeds/usersFixture.json';
import {
  resetDbData,
} from '../testHelpers.js';

describe('User', () => {
  beforeEach(() => resetDbData());
  after(() => resetDbData());

  describe('isValidLogin', () => {
    it('should return false for incorrect passwords', async () => {
      const loginResult = await User.isValidLogin({ phone: '1111111111', password: 'invalid' });
      assert.isFalse(loginResult.success);
    });

    it('should return true for correct passwords', async () => {
      const loginResult = await User.isValidLogin({ phone: '1111111111', password: '1111111111' });
      assert.isTrue(loginResult.success);
    });
  });

  describe('signup', function () {
    this.timeout(5000);
    it('should create a new user', async () => {
      const testUserSignupData = {
        ...usersFixture[0],
        phone: uuidv4(),
        email: uuidv4(),
      };

      const user = await User.signup(testUserSignupData);

      const fieldNamesToIgnore = [
        'id',
        'createdAt',
        'signupUtmSource',
      ];

      User.fieldgroups.summaryFieldgroup
        .filter((userSummaryFieldName) => !fieldNamesToIgnore.includes(userSummaryFieldName))
        .forEach((userSummaryFieldName) => {
          assert.deepEqual(
            user[userSummaryFieldName],
            testUserSignupData[userSummaryFieldName],
            `Field: ${userSummaryFieldName}`
          );
        });
    });
  });

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

  describe('getList', () => {
    it('should get the list of users by filters', async () => {
      const users = await User.getList({
        fieldgroup: ['id', 'email', 'phone', 'roles'],
      });
      assert.equal(users.length, 1);
    });
  });
});
