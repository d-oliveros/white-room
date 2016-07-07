import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/renderer/app';
import { clearDatabase, createUsers } from '../util';

describe('Renderer', () => {
  before(async () => {
    await clearDatabase();
    await createUsers();
  });

  describe('renderClient', () => {
    it('should return a rendered home page', (done) => {
      const url = '/';

      request(app)
        .post('/render')
        .send({ state: {}, url })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          if (res.status === 500) {
            console.log(res.text);
          }

          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should return a rendered user page', (done) => {
      const url = '/admin-page';

      request(app)
        .post('/render')
        .send({ state: {}, url })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          if (res.status === 500) {
            console.log(res.text);
          }

          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should return 404', (done) => {
      const url = '/nonexistant';

      request(app)
        .post('/render')
        .send({ state: {}, url })
        .expect(404)
        .end(done);
    });
  });
});
