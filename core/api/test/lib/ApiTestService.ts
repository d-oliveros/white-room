import type { FastifyInstance } from 'fastify';
import type { Response } from 'light-my-request';

import Fastify from 'fastify';
import { TestService } from '@domain/test/lib/TestService';
import { app } from '../../src/app';

/**
 * A utility class that provides API test infrastructure and helpers.
 *
 * Handles database lifecycle management, provides access to application services,
 * API routes, and includes factories and seeders for test data generation.
 *
 * @example
 * ```ts
 * const apiTestService = new ApiTestService();
 *
 * beforeAll(async () => {
 *   await apiTestService.initDataSource();
 *   await apiTestService.resetData();
 * });
 *
 * afterAll(async () => {
 *   await apiTestService.destroyDataSource();
 * });
 *
 * test('POST /some-route', async () => {
 *   const postResult = await apiTestService.post({
 *     path: '/some-route',
 *     payload: {
 *       some: 'value',
 *     },
 *     expectedCode: 200,
 *   });
 *
 * const getResult = await apiTestService.get({
 *     path: '/some-route',
 *     query: {
 *       some: 'value',
 *     },
 *     expectedCode: 200,
 *   });
 * });
 * ```
 *
 * The resulting value is the "data" property of the common API response object { success, data, error }.
 */
export class ApiTestService extends TestService {
  public fastifyApp: FastifyInstance;

  constructor() {
    super({ context: 'api' });

    this.fastifyApp = Fastify({
      logger: false,
    });

    this.fastifyApp.register(app, {
      domain: this.domain,
    });
  }

  async closeServer() {
    await this.destroyDataSource();
    await this.fastifyApp.close();
  }

  assertSuccessResponse(response: Response, expectedCode: number) {
    const statusCode = response.statusCode;
    const expectsSuccess = expectedCode >= 200 && expectedCode < 300;
    const expectsEmpty = expectedCode === 204;
    const body = expectsEmpty ? null : response.json();

    // If we're expecting an empty response, assert that the response is empty
    if (expectsEmpty) {
      try {
        response.json();
        const error = new Error('Parsed JSON from empty response');
        error.name = 'ResponseNotEmptyError';
        throw error;
      } catch (error) {
        if ((error as Error).name === 'ResponseNotEmptyError') {
          throw error;
        }
      }
    }

    if (!expectsEmpty && (typeof body !== 'object' || !('data' in body) || !('success' in body))) {
      throw new Error('Unexpected API response format');
    }

    if (!expectsEmpty && body.success !== true) {
      throw new Error(
        `Request not successful: ${statusCode} ${body.error || 'API request failed'}`,
      );
    }

    if (expectsSuccess && (statusCode < 200 || statusCode >= 300)) {
      throw new Error(`Request not successful: ${statusCode} ${body}`);
    }

    if (statusCode !== expectedCode) {
      throw new Error(`Unexpected status code: ${statusCode} (expected ${expectedCode})`);
    }
  }

  async injectRequest({
    method,
    path,
    payload,
    query,
    expectedCode,
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    payload?: Record<string, unknown>;
    query?: string | { [k: string]: string | string[] } | undefined;
    expectedCode: number;
  }) {
    let response: Response;

    try {
      response = await this.fastifyApp.inject({
        method,
        url: path,
        payload,
        query,
      });
    } catch (error) {
      throw new Error(`Unexpected error: ${(error as Error).message}`);
    }

    this.assertSuccessResponse(response, expectedCode);
    return expectedCode === 204 ? null : response.json().data || null;
  }

  async get({
    path,
    query,
    expectedCode,
  }: {
    path: string;
    query?: string | { [k: string]: string | string[] } | undefined;
    expectedCode: number;
  }) {
    return this.injectRequest({ method: 'GET', path, query, expectedCode });
  }

  async post({
    path,
    payload,
    expectedCode,
  }: {
    path: string;
    payload?: Record<string, unknown>;
    expectedCode: number;
  }) {
    return this.injectRequest({ method: 'POST', path, payload, expectedCode });
  }

  async put({
    path,
    payload,
    expectedCode,
  }: {
    path: string;
    payload?: Record<string, unknown>;
    expectedCode: number;
  }) {
    return this.injectRequest({ method: 'PUT', path, payload, expectedCode });
  }

  async delete({ path, expectedCode }: { path: string; expectedCode: number }) {
    return this.injectRequest({ method: 'DELETE', path, expectedCode });
  }
}
