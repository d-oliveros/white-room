import express from 'express';
import request from 'supertest';
import { assert } from 'chai';

import {
  USER_ROLE_ADMIN,
} from 'common/userRoles';

import {
  createApiServer,
  actionSpecsList,
} from 'api';

import User from '#server/models/User/index.js';

const SIGN_OTTER_WEBHOOKS_SERVER_API_KEY = '1234';

const createApp = (user) => {
  const app = express();

  process.env.SIGN_OTTER_WEBHOOKS_SERVER_API_KEY = SIGN_OTTER_WEBHOOKS_SERVER_API_KEY;

  if (user) {
    app.use((req, res, next) => {
      res.locals.session = {
        userId: user.id,
        roles: user.roles,
      };
      next();
    });
  }

  app.use('/api/v1', createApiServer(actionSpecsList));
  return app;
};

describe('createApiServer', () => {
  describe('authentication', () => {
    it.skip('should authenticate users with session', async () => {
      const admin = await User.first('*').whereRaw(`'${USER_ROLE_ADMIN}' = ANY(roles)`);

      const response = await request(createApp(admin))
        .post('/api/v1/tbd')
        .send({
          admin,
        });

      assert.isTrue(response.body.success);
    });
  });
});
