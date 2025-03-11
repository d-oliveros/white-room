import type { User } from '@domain/user/user.model';
import { ApiTestService } from './lib/ApiTestService';

describe('User', () => {
  const testService = new ApiTestService();
  let user: User;

  beforeAll(async () => {
    await testService.initDataSource();
    await testService.resetData();
    user = await testService.factories.userFactory.create();
  });

  afterAll(async () => {
    await testService.closeServer();
  });

  test('GET /users', async () => {
    const { users } = await testService.get({
      path: '/users',
      expectedCode: 200,
    });
    expect(users).toEqual(expect.any(Array));
    expect(users).toHaveLength(1);
    expect(users[0].id).toEqual(user.id);
  });

  test('GET /users/:userId', async () => {
    const response = await testService.get({
      path: `/users/${user.id}`,
      expectedCode: 200,
    });
    expect(response.user).toEqual(expect.any(Object));
    expect(response.user.id).toEqual(user.id);
  });

  test('DELETE /users/:userId', async () => {
    await testService.delete({
      path: `/users/${user.id}`,
      expectedCode: 204,
    });
  });
});
