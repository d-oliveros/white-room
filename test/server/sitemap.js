import { assert } from 'chai';
import express from 'express';
import request from 'supertest';

import knex from 'server/db/knex';
import sitemapController from 'server/lib/sitemapController';

import { resetDbData } from '../testHelpers';

function createApp() {
  const app = express();
  app.get('/sitemap.xml', sitemapController);
  return app;
}

describe('sitemap', () => {
  beforeEach(resetDbData);
  after(resetDbData);

  it('should load the sitemap correctly', async () => {
    const app = createApp();
    const res = await request(app)
      .get('/sitemap.xml')
      .expect(200);

    const sitemapString = res.text;

    const activeUsers = await knex('users').select(['id']);

    for (const users of activeUsers) {
      assert.include(sitemapString, `/users/${users.id}`);
    }
  });
});
