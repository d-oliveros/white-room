import { ApiTestService } from './lib/ApiTestService';

describe('Testing', () => {
  const testService = new ApiTestService();

  beforeAll(async () => {
    await testService.initDataSource();
  });

  afterAll(async () => {
    await testService.closeServer();
  });

  test('GET /testing-hello returns 200 with {ok: true}', async () => {
    const response = await testService.fastifyApp.inject({
      method: 'GET',
      url: '/testing-hello',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });
});
