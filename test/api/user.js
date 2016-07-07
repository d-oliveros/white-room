import '../testGlobals';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import { expect } from 'chai';
import { each, clone, every } from 'lodash';
import { User as UserAPI, Post as PostAPI, Admin as AdminAPI } from '../../src/api';
import models, { User, Post, Token, Invitation, EmailLog, Activity } from '../../src/server/models';
import { clearDatabase as clearGraph } from '../../src/server/modules/graph/lib';
import importGraphDatabase from '../../src/server/modules/graph/import';
import redisClient from '../../src/server/database/redis';
import { postFixture, commentFixture, userFixtures } from '../fixtures';
import { clearDatabase, createUsers } from '../util';

const post = postFixture;
const [user1, user2, user3, user4] = userFixtures;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('User', () => {
  beforeEach(async () => {
    await clearDatabase();
    await createUsers();
    await Token.remove({}).exec();
  });

  /**
   * Method: addAppreciation
   */
  describe('addAppreciation', () => {
    it('should add an appreciation', async () => {
      let userDoc = await User.findById(user1._id).exec();
      expect(userDoc.appreciations.length).to.equal(0);
      await User.addAppreciation(userDoc._id, post._id);
      userDoc = await User.findById(userDoc._id).exec();
      expect(userDoc.appreciations.length).to.equal(1);
      expect(userDoc.appreciations[0].toString()).to.equal(post._id);
    });
  });

  /**
   * Method: removeAppreciation
   */
  describe('removeAppreciation', () => {
    it('should remove an appreciation', async () => {
      await User.addAppreciation(user1._id, post._id);
      let userDoc = await User.findById(user1._id).exec();
      expect(userDoc.appreciations.length).to.equal(1);
      expect(userDoc.appreciations[0].toString()).to.equal(post._id);

      await User.removeAppreciation(user1._id, post._id);
      userDoc = await User.findById(user1._id).exec();
      expect(userDoc.appreciations.length).to.equal(0);
    });
  });

  /**
   * Method: getLastActive
   */
  describe('getLastActive', () => {
    it(`should get the last active users`, async () => {
      let users = await UserAPI.getLastActive(20);
      expect(users.length).to.equal(0);

      // Create a question
      const doc = await PostAPI.createPost(user1._id, post);

      // Create an answer
      let comment = clone(commentFixture, true);
      comment.baseId = doc._id;
      delete comment.parentId;
      comment = await PostAPI.createComment(user1._id, comment);

      // Clear cache
      await redisClient.flushallAsync();

      // Get last active users
      users = await UserAPI.getLastActive(20);
      expect(users.length).to.equal(1);
      expect(users[0].id).to.equal(user1._id.toString());
    });

    it(`should not get last active users if content is anonymous`, async () => {
      let users = await UserAPI.getLastActive(20);
      expect(users.length).to.equal(0);

      const doc = await PostAPI.createPost(user1._id, post);
      const comment = clone(commentFixture, true);
      comment.baseId = doc._id;
      comment.anonymous = true;
      delete comment.parentId;

      await PostAPI.createComment(user1._id, comment);
      await redisClient.flushallAsync();

      users = await UserAPI.getLastActive(20);
      expect(users.length).to.equal(0);
    });
  });

  /**
   * Method: delete
   */
  describe('delete', () => {
    it('should delete a user', async () => {
      let user = await User.findById(user1._id).exec();
      expect(user.active).to.equal(true);
      expect(user.deleted).to.equal(undefined);
      expect(user.deletedOn).to.equal(undefined);
      await UserAPI.delete(user._id);
      user = await User.findById(user._id).exec();

      // Expect the deleted flags
      expect(user.active).to.equal(false);
      expect(user.deleted).to.equal(true);
      expect(user.deletedOn).to.not.equal(undefined);

      // Expect their email settings to be turned off
      each(user.settings.emailNotifications.toObject(), (value, key) => {
        expect(user.settings.emailNotifications[key]).to.equal(false);
      });
    });

    it(`should anonymize the user's content`, async () => {
      let doc = await PostAPI.createPost(user1._id, post);
      const postId = doc.id;
      expect(doc.anonymous).to.equal(false);
      expect(doc.user).to.equal(user1.id);

      const comment = clone(commentFixture, true);
      comment.baseId = doc._id;
      delete comment.parentId;

      doc = await PostAPI.createComment(user1._id, comment);
      expect(doc.anonymous).to.equal(false);
      expect(doc.user).to.equal(user1.id);
      await UserAPI.delete(user1._id);

      const postDoc = await Post.findById(postId).exec();

      // Expect the question and the answer to be anonymized
      [postDoc, postDoc.comments[0]].forEach((post) => {
        expect(post.anonymous).to.equal(true);
        expect(post._user.toString()).to.equal(user1.id);
        expect(post.user).to.not.equal(user1.id);
        expect(post.anonymousUser).to.equal(user1.id);
      });
    });

    it('should clear the subscriptions and reset the counts', async () => {
      await UserAPI.subscribe(user1._id, user2._id);
      await UserAPI.delete(user1._id);
      const user = await User.findById(user2._id).exec();
      expect(user.counts.subscribers).to.equal(0);
    });
  });

  /**
   * Method: log
   */
  describe('log', () => {
    it('should log a date', async () => {
      let user = await User.findById(user1._id).exec();
      expect(user.logs.lastActive).to.equal(undefined);
      await UserAPI.log(user._id, 'logs.lastActive');
      user = await User.findById(user._id).exec();
      expect(user.logs.lastActive).to.not.equal(undefined);
    });
  });

  /**
   * Method: passwordReset
   */
  describe('passwordReset', () => {
    it('should reset the password', async () => {
      await UserAPI.passwordReset(user1.email);
      const token = await Token.findOne({ owner: user1._id }).exec();
      expect(token.owner.toString()).to.equal(user1._id);
    });
  });

  /**
   * Method: changePassword
   */
  describe('changePassword', () => {
    it('should change password when isChangingPassword is true', async () => {
      const newPass = 'Wiselike';
      const edits = { $set: { isChangingPassword: true }};
      await User.update({ _id: user1._id }, edits).exec();
      await UserAPI.changePassword(user1._id, { new: newPass });
      const userDoc = await User.findById(user1._id).exec();
      const isValid = await userDoc.comparePassword(newPass);
      expect(isValid).equal(true);
    });
  });

  /**
   * Method: updateProfile
   */
  describe('updateProfile', () => {
    it(`should update a user's profile`, async () => {
      let user = await User.findById(user1._id);

      const edits = {
        name: 'newName',
        headline: 'newHeadline',
        summary: 'newSummary',
        email: 'newemail@wiselike.com',
        image: 'newImage.jpg',
        backgroundImage: 'newBackgroundImage.jpg',
        socialSites: ['www.a.com', 'www.b.com']
      };

      await UserAPI.updateProfile(user1._id, edits);
      user = await User.findById(user1._id);

      each(edits, (edit, key) => {
        expect(user[key]).to.deep.equal(edits[key]);
      });
    });

    it('should add and remove tags from user profile', async () => {
      let tagsEdition = ['oneTag', 'tag1', 'THIS IS TAG 3'];
      await UserAPI.updateProfile(user1._id, { tagsEdition });
      const { tags } = await User.findById(user1._id);
      expect(tags.length).to.equal(3);
      expect(every(tags, (tag) => tagsEdition.indexOf(tag.name) > -1));

      tagsEdition = ['a diff tag'];
      await UserAPI.updateProfile(user1._id, { tagsEdition });
      const user = await User.findById(user1._id);
      expect(user.tags.length).to.equal(1);
      expect(every(user.tags, (tag) => tagsEdition.indexOf(tag.name) > -1));
    });

    it('should update people with similar interests', async () => {
      let user = await User.findById(user1._id);
      expect(user.usersSimilarInterests.length).to.equal(0);

      // Answer a question using user2 and user3
      for (const askedTo of [user2, user3]) {
        const pFixture = Object.assign({}, postFixture, { askedTo: askedTo._id });
        const post = await PostAPI.createPost(user1._id, pFixture);
        const comment = clone(commentFixture, true);
        comment.baseId = comment.parentId = post._id;
        await PostAPI.createComment(askedTo._id, comment);
      }

      await clearGraph();
      await importGraphDatabase(models);

      await UserAPI.updateProfile(user2._id, { tagsEdition: ['tag1'] });
      await UserAPI.updateProfile(user3._id, { tagsEdition: ['tag1', 'tag2'] });
      await UserAPI.updateProfile(user4._id, { tagsEdition: ['tag1', 'tag2'] });
      await UserAPI.updateProfile(user1._id, { tagsEdition: ['tag1', 'tag2'] });

      // Users with similar interests should not include user4,
      // as user4 has not answered anything
      user = await User.findById(user1._id);
      expect(user.usersSimilarInterests.length).to.equal(2);
      expect(user.usersSimilarInterests[0]._id.toString()).to.equal(user3._id.toString());
      expect(user.usersSimilarInterests[1]._id.toString()).to.equal(user2._id.toString());
      expect(user.logs.usersSimilarInterestsCalculated).to.be.a('date');
      await sleep(10);
      expect(moment(user.logs.usersSimilarInterestsCalculated).diff()).to.be.lt(0);

      // Expect users without similar tags not to appear in the array
      await UserAPI.updateProfile(user3._id, { tagsEdition: ['tag3'] });
      await UserAPI.updateProfile(user1._id, { tagsEdition: ['tag1'] });

      user = await User.findById(user1._id);
      expect(user.usersSimilarInterests.length).to.equal(1);
      expect(user.usersSimilarInterests[0]._id.toString()).to.equal(user2._id.toString());
    });
  });

  /**
   * Method: subscribeUser(subscriber, target)
   */
  describe('subscribe', () => {
    it('should subscribe to the target user', async function() {
      const subscriber = user1;
      const target = user2;

      this.timeout(4000);

      await UserAPI.subscribe(subscriber._id, target._id);
      const subscriberDoc = await User.findById(subscriber._id).exec();
      expect(subscriberDoc.subscriptions.length).to.equal(1);
      expect(subscriberDoc.subscriptions[0].toString()).to.equal(target._id.toString());

      const targetDoc = await User.findById(target._id).exec();
      expect(targetDoc.counts.subscribers).to.equal(1);

      const activity = await Activity.find({type: 'subscription'}).exec();
      expect(activity.length).to.equal(1);
      expect(activity[0].user.id).equal(subscriber._id.toString());
      expect(activity[0].target.id).equal(target._id.toString());

      const logs = await EmailLog.find({name: 'newSubscribers'}).exec();
      expect(logs.length).equal(1);
    });

    it('should error when subscribing twice to the target user', async () => {
      const subscriber = user1;
      const target = user2;

      try {
        await UserAPI.subscribe(subscriber._id, target._id);
        await UserAPI.subscribe(subscriber._id, target._id);
        throw 'DOUBLE_SUBSCRIPTION'; // eslint-disable-line
      } catch (err) {
        expect(err).not.to.equal('DOUBLE_SUBSCRIPTION');
        expect(typeof err).to.equal('object');
      }
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from the target user', async () => {
      const subscriber = user1;
      const target = user2;

      await UserAPI.subscribe(subscriber._id, target._id);
      await UserAPI.unsubscribe(subscriber._id, target._id);
      const subscriberDoc = await User.findById(subscriber._id).exec();
      expect(subscriberDoc.subscriptions.length).to.equal(0);
      expect(subscriberDoc.subscriptions[0]).to.be.undefined; // eslint-disable-line no-unused-expressions
    });
  });

  describe('sendInvites', () => {
    it('should send all invitations', async () => {
      await Invitation.create([
        { email: 'invite@wiselike.com' },
        { email: 'invite2@wiselike.com' },
        { email: 'invive3@wiselike.com' }
      ]);

      await AdminAPI.sendInvites('all');
      const emails = await EmailLog.count({ name: 'requestInvite' }).exec();
      expect(emails).equal(3);
    });

    it('should send 2 invitations', async () => {
      await Invitation.create([
        { email: 'invite@wiselike.com' },
        { email: 'invite2@wiselike.com' },
        { email: 'invive3@wiselike.com' }
      ]);

      await EmailLog.remove().exec();
      await AdminAPI.sendInvites(2);
      const emails = await EmailLog.count({ name: 'requestInvite' }).exec();
      expect(emails).equal(2);
    });
  });

  describe('assignInvitations', () => {
    it('should assign invitations to a user', async () => {
      await AdminAPI.assignInvitations({ userPath: user1.path, count: 3 });
      const userDoc = await User.findOne({ path: user1.path }).exec();
      expect(userDoc.invitations.number).equal(3);
      expect(userDoc.invitations.token.length).equal(6);
    });

    it('should assign invitations to all users', async () => {
      await AdminAPI.assignInvitations({ count: 5 });
      const users = await User.find().exec();
      each(users, (user) => {
        expect(user.invitations.number).equal(5);
        expect(user.invitations.token.length).equal(6);
      });
    });
  });

  describe('removeToken', () => {
    it('should remove a token', async () => {
      await AdminAPI.assignInvitations({ userPath: user1.path, count: 3 });
      let user = await User.findOne({ path: user1.path }).exec();
      const token = await Token.generate(user._id);
      await UserAPI.removeToken(token._id);
      user = await User.findOne({ path: user.path }).exec();
      expect(user.invitations.number).equal(2);
    });
  });

  describe('subscribeToAnswers', () => {
    it('should subscribe to user', async () => {
      await UserAPI.subscribe(user1._id, user2._id);
      await UserAPI.subscribeToAnswers(user1._id, user2._id);
      const user = await User.findById(user1._id).exec();
      expect(user.subscriptionsAnswer.length).equal(1);
      expect(user.subscriptionsAnswer[0]).equal(user2._id.toString());
    });

    it('shouldn\'t subscribe twice to user', async () => {
      await UserAPI.subscribe(user1._id, user2._id);
      await UserAPI.subscribeToAnswers(user1._id, user2._id);
      const user = await User.findById(user1._id).exec();
      expect(user.subscriptionsAnswer.length).equal(1);
    });
  });

  describe('unsubscribeToAnswers', () => {
    it('should unsubscribe to user', async () => {
      await UserAPI.subscribe(user1._id, user2._id);
      await UserAPI.subscribeToAnswers(user1._id, user2._id);
      await UserAPI.unsubscribeToAnswers(user1._id, user2._id);
      const user = await User.findById(user2._id).exec();
      expect(user.subscriptionsAnswer.length).equal(0);
    });
  });

  describe('exportUsers', () => {
    it('should export active users by date', async () => {

      const post = await PostAPI.createPost(user1._id, postFixture);
      const comment = clone(commentFixture, true);
      comment.baseId = comment.parentId = post._id;
      await PostAPI.createComment(user1._id, comment);

      const dataDir = path.join(global.__root, 'test/data');

      // Remove other test files
      const oldFileNames = fs.readdirSync(dataDir);
      for (const oldFile of oldFileNames) {
        fs.unlinkSync(path.join(dataDir, oldFile));
      }

      const today = moment().add(1, 'days').toISOString().substr(0, 10);
      const yesterday = moment().subtract(1, 'days').toISOString().substr(0, 10);

      const fileName = await UserAPI.exportUsers(yesterday, today);
      const csv = fs.readFileSync(path.join(dataDir, fileName), 'utf8');

      expect(csv).to.be.an('string');
      const csvLines = csv.split('\n');
      const line1 = csvLines[0].split(',');
      const line2 = csvLines[1].split(',');

      expect(line1[0]).to.be.equal('"url"');
      expect(line1[1]).to.be.equal('"category"');
      expect(line2[0].startsWith(`"http://wiselike.dev/`)).to.equals(true);
    });
  });
});
