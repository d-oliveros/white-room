import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import type { PostgresDatabaseConfig } from '@domain/lib/DataSourceManager';

import 'reflect-metadata';
import { awsLambdaFastify, type PromiseHandler } from '@fastify/aws-lambda';
import { createLogger } from '@namespace/logger';
import { createPostgresDataSourceManager } from '@domain/lib/DataSourceManager';
import { getDatabasePassword } from '@domain/lib/secretsManager';
import { AppFactory } from './app';

const logger = createLogger('core.api');

const { CORE_API_URL, CORE_API_CORS_ORIGIN, AWS_LAMBDA_FUNCTION_NAME, CORE_DB_SECRET_ARN } =
  process.env;

const isLambda = !!AWS_LAMBDA_FUNCTION_NAME;

/**
 * Initializes the application by creating a data source and instanciating the Fastify app.
 * @returns {Promise<FastifyInstance>} A promise that resolves to the configured Fastify app instance.
 */
async function initApp() {
  const dbConfig: Partial<PostgresDatabaseConfig> = {};

  if (CORE_DB_SECRET_ARN) {
    dbConfig.password = await getDatabasePassword(CORE_DB_SECRET_ARN);
  }

  const dataSourceManager = createPostgresDataSourceManager(dbConfig);
  await dataSourceManager.initialize();

  const fastifyApp = AppFactory.create({
    dataSource: dataSourceManager.getDataSource(),
    corsOrigin: CORE_API_CORS_ORIGIN,
  });
  return fastifyApp;
}

/**
 * Starts listening for incoming requests on the local port.
 */
async function initServer() {
  try {
    logger.info(`[ starting ] API Url: ${CORE_API_URL}`);
    const fastifyApp = await initApp();
    await fastifyApp.listen({
      port: 3000,
      host: '0.0.0.0',
    });
    logger.info(`[ ready ] Server listening on port 3000`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

/**
 * Initialize the Fastify app outside the handler
 */
let lambdaFastifyAppPromise: Promise<PromiseHandler>;
function initLambda() {
  if (!lambdaFastifyAppPromise) {
    lambdaFastifyAppPromise = initApp()
      .then((fastifyApp) => awsLambdaFastify(fastifyApp))
      .catch((err) => {
        logger.error(err);
        process.exit(1);
      });
  }
}

/**
 * Exposes the AWS Lambda handler for the Fastify app.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  const lambdaFastifyApp = await lambdaFastifyAppPromise;
  return lambdaFastifyApp(event, context);
};

if (isLambda) {
  initLambda();
} else {
  initServer();
}
