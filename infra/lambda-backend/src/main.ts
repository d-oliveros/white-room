import Fastify from 'fastify';
import * as path from 'path';
import { createLogger } from '@namespace/logger';
import { app } from './app/app';

const logger = createLogger('lambda.backend');

const host = 'localhost';
const port = process.env.LAMBDA_DEV_SERVER_PORT ? Number(process.env.LAMBDA_DEV_SERVER_PORT) : 5252;
const rootDir = path.resolve(__dirname, '../../..');

// Instantiate Fastify with some config
const server = Fastify({
  logger: false,
});

// Register your application as a normal plugin.
server.register(app, {
  rootDir,
});

// Start listening.
server.listen({ port, host }, (error) => {
  if (error) {
    logger.error(error);
    process.exit(1);
  } else {
    logger.info(`[ ready ] http://${host}:${port}`);
  }
});
