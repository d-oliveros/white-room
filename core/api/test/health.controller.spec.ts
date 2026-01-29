import { ApiTestService } from './lib/ApiTestService';

describe('HealthController', () => {
  let apiTestService: ApiTestService;

  beforeAll(async () => {
    apiTestService = new ApiTestService();
    await apiTestService.initDataSource();
  });

  afterAll(async () => {
    await apiTestService.closeServer();
  });

  describe('GET /testing-hello', () => {
    it('should return 200 status with { ok: true } response body', async () => {
      const response = await apiTestService.fastifyApp.inject({
        method: 'GET',
        url: '/testing-hello',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toEqual({ ok: true });
    });

    it('should return application/json content type', async () => {
      const response = await apiTestService.fastifyApp.inject({
        method: 'GET',
        url: '/testing-hello',
      });

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should be accessible without authentication', async () => {
      const response = await apiTestService.fastifyApp.inject({
        method: 'GET',
        url: '/testing-hello',
      });

      expect(response.statusCode).toBe(200);
      expect([200, 201, 202, 203, 204, 205, 206]).toContain(response.statusCode);
    });

    it('should return consistent response on multiple calls', async () => {
      const calls = await Promise.all([
        apiTestService.fastifyApp.inject({ method: 'GET', url: '/testing-hello' }),
        apiTestService.fastifyApp.inject({ method: 'GET', url: '/testing-hello' }),
        apiTestService.fastifyApp.inject({ method: 'GET', url: '/testing-hello' }),
      ]);

      calls.forEach((response) => {
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toEqual({ ok: true });
      });
    });
  });
});
