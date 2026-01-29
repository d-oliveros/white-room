import { describe, it, expect } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import TestingController from './testing.controller';

describe('TestingController', () => {
  it('should register /testing-hello route', () => {
    const mockFastify = {
      route: jest.fn(),
    } as unknown as FastifyInstance;

    TestingController(mockFastify);

    expect(mockFastify.route).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/testing-hello',
      }),
    );
  });

  it('should return { ok: true } from handler', () => {
    const mockFastify = {
      route: jest.fn(),
    } as unknown as FastifyInstance;

    TestingController(mockFastify);

    const routeCall = (mockFastify.route as jest.Mock).mock.calls[0][0];
    const handler = routeCall.handler;
    const result = handler();

    expect(result).toEqual({ ok: true });
  });

  it('should use GET method', () => {
    const mockFastify = {
      route: jest.fn(),
    } as unknown as FastifyInstance;

    TestingController(mockFastify);

    const routeCall = (mockFastify.route as jest.Mock).mock.calls[0][0];
    expect(routeCall.method).toBe('GET');
  });
});
