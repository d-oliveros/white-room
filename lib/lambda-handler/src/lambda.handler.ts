import type { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import type { AwsLambdaEventPayload } from './lambda.handler.utils';
import { createLogger } from '@namespace/logger';
import { EventType, determineEventType } from './lambda.handler.utils';

const logger = createLogger('lambda.handler');

// Define the handler and event types
type LambdaFunction<T = unknown, R = unknown> = (payload: T) => Promise<R>;

// Overloads for lambdaHandler
export function lambdaHandler<T extends object | void, R>(
  handler: LambdaFunction<T, R>,
): {
  (event: T): Promise<R>;
  (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
  (event: SQSEvent): Promise<R>;
};

/**
 * A higher-order function that wraps AWS Lambda handlers to provide consistent error handling and response formatting.
 *
 * Supports three types of Lambda events:
 * 1. Direct invocation with a payload object
 * 2. API Gateway events - Handles HTTP requests, parses JSON body, and formats responses
 * 3. SQS events - Processes message batches, parsing JSON payloads from message bodies
 *
 * For API Gateway events:
 * - Automatically parses JSON request bodies
 * - Returns formatted responses with proper headers
 * - Handles errors and returns appropriate error responses
 *
 * For SQS events:
 * - Processes all records in the batch
 * - Returns result from first record for consistency
 *
 * @param handler - The Lambda function implementation to wrap
 * @returns A wrapped handler that handles different event types consistently
 */
export function lambdaHandler<T extends object | void = object | void, R = unknown>(
  handler: LambdaFunction<T, R>,
) {
  return async (event: AwsLambdaEventPayload<T>): Promise<R | APIGatewayProxyResult> => {
    const eventType = determineEventType(event);

    switch (eventType) {
      case EventType.VOID:
        return handler(undefined as T);

      case EventType.INVALID:
        throw new Error('Invalid event: Event must be an object or undefined');

      case EventType.DIRECT:
        logger.info('Lambda handler: Handling direct invocation');
        return handler(event as T);

      case EventType.SQS: {
        logger.info('Lambda handler: Handling SQS event');
        const results = [];
        const errors = [];
        for (const record of (event as SQSEvent).Records) {
          try {
            const payload = JSON.parse(record.body) as T;
            const result = await handler(payload);
            results.push(result);
          } catch (error) {
            logger.error(error, `Error processing SQS record: ${record.messageId}`);
            errors.push(error);
          }
        }
        if (results.length === 0) {
          throw new Error(
            `No SQS records were processed successfully: ${errors.map((error) => (error as Error).message).join(', ')}`,
          );
        }
        return results[0] as R;
      }

      case EventType.API_GATEWAY:
        logger.info('Lambda handler: Handling API Gateway event');
        try {
          const apiEvent = event as APIGatewayProxyEvent;
          const payload = apiEvent.body ? JSON.parse(apiEvent.body) : {};
          const result = await handler(payload as T);

          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              data: result ?? null,
              error: null,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          };
        } catch (error) {
          logger.error(error, 'Lambda handler error');
          const statusCode = (error as { statusCode?: number }).statusCode || 500;
          return {
            statusCode,
            body: JSON.stringify({
              success: false,
              data: null,
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          };
        }
    }
  };
}
