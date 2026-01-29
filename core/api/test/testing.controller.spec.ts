import { ApiTestService } from './lib/ApiTestService';

describe('Testing Controller', () => {
  const testService = new ApiTestService();

  beforeAll(async () => {
    await testService.initDataSource();
  });

  afterAll(async () => {
    await testService.closeServer();
  });

  test('GET /testing-hello', async () => {
    const response = await testService.get({
      path: '/testing-hello',
      expectedCode: 200,
    });
    expect(response).toEqual({ ok: true });
  });
});
