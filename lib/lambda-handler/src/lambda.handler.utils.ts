import type { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';

export type AwsLambdaEventPayload<T = unknown> = APIGatewayProxyEvent | SQSEvent | T;

export enum EventType {
  DIRECT = 'DIRECT',
  SQS = 'SQS',
  API_GATEWAY = 'API_GATEWAY',
  VOID = 'VOID',
  INVALID = 'INVALID',
}

export interface SQSEventLike {
  Records: unknown[];
}

export interface APIGatewayEventLike {
  httpMethod: string;
}

export function isSQSEvent(event: unknown): event is SQSEventLike {
  return (
    typeof event === 'object' &&
    event !== null &&
    'Records' in event &&
    Array.isArray((event as SQSEventLike).Records)
  );
}

export function isAPIGatewayEvent(event: unknown): event is APIGatewayEventLike {
  return (
    typeof event === 'object' &&
    event !== null &&
    'httpMethod' in event &&
    typeof (event as APIGatewayEventLike).httpMethod === 'string'
  );
}

export function determineEventType(event: unknown): EventType {
  if (event === undefined) {
    return EventType.VOID;
  }

  if (event === null || typeof event !== 'object') {
    return EventType.INVALID;
  }

  if (isSQSEvent(event)) {
    return EventType.SQS;
  }

  // Type guard for API Gateway events
  if (isAPIGatewayEvent(event)) {
    return EventType.API_GATEWAY;
  }

  return EventType.DIRECT;
}
