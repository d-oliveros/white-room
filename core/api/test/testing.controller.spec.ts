import { ApiTestService } from './lib/ApiTestService';

describe('Testing', () => {
  const testService = new ApiTestService();

  beforeAll(async () => {
    await testService.initDataSource();
    await testService.resetData();
  });

  afterAll(async () => {
    await testService.closeServer();
  });

  describe('GET /testing-hello', () => {
    it('returns HTTP 200 status code', async () => {
      const response = await testService.fastifyApp.inject({
        method: 'GET',
        url: '/testing-hello',
      });
      expect(response.statusCode).toBe(200);
    });

    it('returns response with ApiResponse envelope', async () => {
      const response = await testService.fastifyApp.inject({
        method: 'GET',
        url: '/testing-hello',
      });
      const payload = response.json();

      expect(payload).toEqual({
        success: true,
        data: { ok: true },
        error: null,
      });
    });

    it('returns correct response structure', async () => {
      const response = await testService.fastifyApp.inject({
        method: 'GET',
        url: '/testing-hello',
      });
      const payload = response.json();

      expect(payload).toHaveProperty('success', true);
      expect(payload).toHaveProperty('data');
      expect(payload.data).toHaveProperty('ok', true);
      expect(payload).toHaveProperty('error', null);
    });

    it('is registered as GET /testing-hello route', async () => {
      const response = await testService.fastifyApp.inject({
        method: 'GET',
        url: '/testing-hello',
      });
      expect(response.statusCode).not.toBe(404);
    });

    it('returns identical response on multiple calls', async () => {
      const responses = await Promise.all([
        testService.fastifyApp.inject({ method: 'GET', url: '/testing-hello' }),
        testService.fastifyApp.inject({ method: 'GET', url: '/testing-hello' }),
        testService.fastifyApp.inject({ method: 'GET', url: '/testing-hello' }),
      ]);

      const payloads = responses.map((r) => r.json());

      expect(payloads[0]).toEqual(payloads[1]);
      expect(payloads[1]).toEqual(payloads[2]);
    });
  });
});
