import type { DomainModule } from '@domain';
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    domain: DomainModule;
  }
}
