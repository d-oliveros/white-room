import type { FastifyInstance } from 'fastify';
import type { Lambda, LambdaPayloadMap } from '@namespace/lambda';
import type { AppOptions } from '../app';

import path from 'path';
import { lambdaSettings, LambdaClient, Environment } from '@namespace/lambda';
import { createLogger } from '@namespace/logger';

const logger = createLogger('lambda.backend');

const lambdaApiClient = new LambdaClient({
  environment: Environment.Dev,
});

export default async function (fastify: FastifyInstance, { rootDir }: AppOptions) {
  fastify.post('/*', async function (request) {
    logger.info(
      {
        url: request.url,
        body: request.body,
      },
      'Request received',
    );
    const lambda = request.url.slice(1) as Lambda;

    const lambdaFunctionConfig = lambdaSettings[lambda];

    if (!lambdaFunctionConfig) {
      const error = new Error(`Lambda function ${lambda} not found`);
      logger.error(error, `Lambda function ${lambda} not found`);
      return {
        success: false,
        data: null,
        error: error.message,
        errorStack: error.stack,
      };
    }

    if (lambdaFunctionConfig.runtime === 'python') {
      logger.info(
        {
          url: request.url,
          body: request.body,
        },
        `Invoking dev lambda function ${lambda}`,
      );
      const result = await lambdaApiClient.request(
        lambda,
        (request.body || {}) as LambdaPayloadMap[typeof lambda]['request'],
      );
      return {
        success: true,
        data: result ?? null,
        error: null,
        errorStack: null,
      };
    }

    const projectDir = lambdaFunctionConfig.projectDir;
    const projectModule = path.join(rootDir, projectDir, 'src', 'main.js');

    let lambdaHandler;

    try {
      logger.info(
        {
          url: request.url,
          body: request.body,
        },
        'Importing lambda function',
      );
      lambdaHandler = (await import(projectModule)).handler;
    } catch (error) {
      logger.error(error, `Error while importing lambda function ${lambda}`);
      return {
        success: false,
        data: null,
        error: (error as Error).message || 'Internal server error',
        errorStack: (error as Error).stack,
      };
    }

    try {
      logger.info(
        {
          url: request.url,
          body: request.body,
        },
        'Running local lambda function',
      );
      const result = await lambdaHandler(request.body || {});
      return {
        success: true,
        data: result ?? null,
        error: null,
        errorStack: null,
      };
    } catch (error) {
      logger.error(error, `Error while invoking lambda function ${lambda}`);
      return {
        success: false,
        data: null,
        error: (error as Error).message || 'Internal server error',
        stackStack: (error as Error).stack,
      };
    }
  });
}
