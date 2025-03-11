import type { ApiResponse } from '@namespace/shared';
import type { LambdaPayloadMap } from './lambda.schemas';

import { setTimeout as sleep } from 'node:timers/promises';
import { LambdaClient as AwsLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import { createLogger } from '@namespace/logger';
import { Environment } from './lambda.enums';
import { lambdaSettings } from './lambda.settings';

const { ENVIRONMENT } = process.env;

const lambdaClient = new AwsLambdaClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const logger = createLogger('LambdaClient');

async function invokeLambdaFunction<K extends keyof LambdaPayloadMap>(
  lambda: K,
  payload: LambdaPayloadMap[K]['request'],
  environment: Environment = (ENVIRONMENT as Environment) || Environment.Dev,
): Promise<LambdaPayloadMap[K]['response']> {
  const lambdaFunctionName = `${environment}-${String(lambda)}`;
  logger.trace(
    {
      lambda,
      functionName: lambdaFunctionName,
      payload,
    },
    `Invoking lambda function ${lambdaFunctionName}`,
  );
  try {
    const startTime = Date.now();
    const command = new InvokeCommand({
      FunctionName: lambdaFunctionName,
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    const response = await lambdaClient.send(command);

    if (response.StatusCode !== 200) {
      throw new Error(`Lambda invocation failed with status ${response.StatusCode}`);
    }

    const result = (
      response.Payload ? JSON.parse(new TextDecoder('utf-8').decode(response.Payload)) : null
    ) as LambdaPayloadMap[K]['response'];

    const duration = Date.now() - startTime;

    logger.info(
      {
        lambda,
        functionName: lambdaFunctionName,
        statusCode: response.StatusCode,
        durationMs: duration,
      },
      `Successfully invoked lambda function ${lambdaFunctionName}`,
    );

    return result;
  } catch (lambdaError) {
    logger.error(
      {
        lambda,
        functionName: lambdaFunctionName,
        error: lambdaError,
        payload,
      },
      `Error while invoking lambda function ${lambdaFunctionName}`,
    );

    throw lambdaError;
  }
}

async function parseLocalLambdaApiResponse<T>(response: Response): Promise<T> {
  let responseJson: ApiResponse | null = null;
  try {
    responseJson = (await response.json()) as ApiResponse;
  } catch (e) {}

  if (!responseJson) {
    throw new Error(`Lambda invocation failed: ${response.statusText} (${response.status})`);
  }
  if (!responseJson.success) {
    throw new Error(`Lambda invocation failed: ${responseJson.error || 'Internal server error'}`);
  }
  return responseJson.data as T;
}

/**
 * Manages interactions with Lambda functions exposed via API Gateway.
 *
 * Usage:
 * const lambdaApi = new LambdaClient({
 *   domainName: 'namespace.com'
 *   environment: Environment.Prod,
 * });
 *
 * const response = await lambdaApi.request(Lambda.SlackMessage, {
 *   channel: 'your-slack-channel',
 *   text: 'Hello, world!',
 * });
 */
export class LambdaClient {
  private environment: Environment;

  constructor({
    environment = (ENVIRONMENT as Environment) || Environment.Local,
  }: {
    environment?: Environment;
  } = {}) {
    // Validate that environment is a valid enum value
    if (!Object.values(Environment).includes(environment)) {
      throw new Error(
        `Invalid environment: ${environment}. Must be one of: ${Object.values(Environment).join(', ')}`,
      );
    }
    this.environment = environment;
  }

  async request<K extends keyof LambdaPayloadMap>(
    lambda: K,
    payload: LambdaPayloadMap[K]['request'],
  ): Promise<LambdaPayloadMap[K]['response']> {
    try {
      const lambdaFunctionConfig = lambdaSettings[lambda];
      let responseBody: LambdaPayloadMap[K]['response'] | null = null;

      // Local lambda dev server invocation
      if (lambdaFunctionConfig.runtime !== 'python' && this.environment === Environment.Local) {
        logger.trace({ lambda, payload }, `Calling Local Lambda API: ${String(lambda)}`);
        try {
          const response = await fetch(`http://localhost:5252/${String(lambda)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          responseBody =
            await parseLocalLambdaApiResponse<LambdaPayloadMap[K]['response']>(response);
        } catch (error) {
          // Log detailed error information for fetch failures
          if (error instanceof TypeError) {
            // Network errors like ECONNREFUSED
            logger.error(
              { lambda, payload, code: error.name, message: error.message },
              `Network error calling Local Lambda API: ${String(lambda)} - Is the dev server running on port 5252?`,
            );
          } else {
            // Other fetch errors
            logger.error(
              { lambda, payload, error: error instanceof Error ? error.stack : String(error) },
              `Error calling Local Lambda API: ${String(lambda)}`,
            );
          }
          throw error;
        }
      }
      // AWS lambda invocation
      else {
        const MAX_RETRIES = 5;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            responseBody = await invokeLambdaFunction(
              lambda,
              payload,
              this.environment === Environment.Local ? Environment.Dev : this.environment,
            );
            break;
          } catch (error) {
            logger.error(
              {
                lambda,
                payload,
                attempt,
                error: error instanceof Error ? error.stack : String(error),
              },
              `Error calling Lambda API: ${String(lambda)}`,
            );
            if (attempt === MAX_RETRIES) {
              throw error;
            }
            await sleep(Math.pow(2, attempt) * 100);
          }
        }
      }

      logger.trace({ responseBody }, `Lambda API response: ${String(lambda)}`);

      return responseBody as LambdaPayloadMap[K]['response'];
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      throw new Error(
        `Failed to call Lambda API at ${String(lambda)}. ` + `Error: ${errorMessage}`,
      );
    }
  }
}
