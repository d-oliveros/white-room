import '../testGlobals';
import '../../src/server/database';
import { expect } from 'chai';
import { every } from 'lodash';
import dataGenerator from '../../util/data-generator';
import { User, Tag, Post } from '../../src/server/models';
import { clearDatabase } from '../util';

describe('Data Generator', function() {
  this.timeout(25000);

  before(async () => {
    await clearDatabase();
  });

  it('should generate a bunch of data', async () => {
    const params = {
      users: 10,
      posts: 10,
      tags: 10,
      subscriptions: 0,
      adminUser: false,
      testUser: false,
      verbose: false,
      reindex: false
    };

    await dataGenerator(params);

    const values = await Promise.all([
      User.count().exec(),
      Tag.count().exec(),
      Post.count().exec()
    ]);

    expect(every(values));
  });
});
