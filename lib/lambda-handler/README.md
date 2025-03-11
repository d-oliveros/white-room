# Lambda Handler

A utility package for wrapping AWS Lambda functions with consistent error handling and response formatting.

## Features

- Unified error handling and response formatting
- Support for multiple Lambda event types:
  - Direct invocation with payload objects
  - API Gateway events with HTTP request/response handling
  - SQS events with message batch processing
- Automatic JSON parsing of request bodies
- Standardized API Gateway response format
- Proper HTTP headers and status codes

## Usage

This example is taken from the Slack Message Lambda function:

```typescript
import { lambdaHandler } from '@namespace/lambda-handler';
import { SlackMessage } from './slackClient.schemas';
import { postSlackMessage } from './slackClient';

export const handler = lambdaHandler<SlackMessage, null>(async (slackMessage) => {
  await postSlackMessage(slackMessage);
  return null;
});
```

We can then call this Lambda function directly using the AWS SDK, via API Gateway using the `LambdaApi` module, or via SQS using the `LambdaQueueClient` module.

```typescript
const lambdaApi = new LambdaApi();
await lambdaApi.request(Lambda.SlackMessage, {
  channel: 'general',
  text: 'Hello, world!',
});
```

```typescript
const lambdaQueueClient = new LambdaQueueClient();
await lambdaQueueClient.push(Lambda.SlackMessage, {
  channel: 'general',
  text: 'Hello, world!',
});
```

This package will automatically parse the corresponding Lambda event type, and pass the payload to the Lambda function.
