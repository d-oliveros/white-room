import { ApiTestService } from './lib/ApiTestService';

describe('Testing', () => {
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
    expect(response).toEqual(expect.any(Object));
    expect(response.ok).toBe(true);
    expect(response.now).toEqual(expect.any(Number));
  });
});
