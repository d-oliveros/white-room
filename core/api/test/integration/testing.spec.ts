import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import { AppFactory } from '../../src/app';
import { TestService } from '@domain/test/lib/TestService';

describe('Testing Controller - Integration Tests', () => {
  let fastify: FastifyInstance;
  const testService = new TestService({ context: 'api' });

  beforeAll(async () => {
    await testService.initDataSource();
    fastify = AppFactory.create({
      dataSource: testService.dataSource,
      corsOrigin: 'http://localhost:4200',
    });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
    await testService.destroyDataSource();
  });

  it('GET /testing-hello should return 200 with { ok: true }', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/testing-hello',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ ok: true });
  });

  it('GET /testing-hello should return application/json content type', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/testing-hello',
    });

    expect(response.headers['content-type']).toContain('application/json');
  });

  it('POST /testing-hello should not be allowed', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/testing-hello',
      payload: {},
    });

    expect(response.statusCode).toBe(405);
  });

  it('should respond immediately without database calls', async () => {
    const startTime = Date.now();
    const response = await fastify.inject({
      method: 'GET',
      url: '/testing-hello',
    });
    const endTime = Date.now();

    expect(response.statusCode).toBe(200);
    expect(endTime - startTime).toBeLessThan(100);
  });
});
