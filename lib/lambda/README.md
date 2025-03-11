# Lambda API and Queue Library

A TypeScript library for defining and interacting with AWS Lambda functions through HTTP APIs and SQS queues.

## Features

- HTTP API Client for Lambda functions
- SQS Queue Client for asynchronous Lambda invocations
- Type-safe payload handling
- Environment-specific configuration
- Local Lambda API development server (powered by `/infra/lambda-backend`)

## Usage

### Lambda API (HTTP)

For Lambda functions exposed through API Gateway:

```Typescript
import { Lambda,LambdaApi, Environment } from '@namespace/lambda';

const lambdaApi = new LambdaApi({
  authToken: 'your-auth-token',
  environment: Environment.Dev,
});

// Make a request to a Lambda function
const response = await lambdaApi.request(Lambda.SlackMessage, {
  channel: 'general',
  text: 'Hello, world!',
});
```

### Lambda Queue (SQS)

For asynchronous Lambda invocations through SQS:

```Typescript
import { Lambda, lambdaQueueClient } from '@namespace/lambda';

await lambdaQueueClient.push(Lambda.SlackMessage, {
  channel: 'general',
  text: 'Hello, world!',
});
```

## Local Development

For local development, a separate package is provided `/infra/lambda-backend`, which will start a local server that will execute the corresponding lambda function. In order to mount a new lambda function in the local lambda dev server, you must set the lambda function as an implicit dependency in the `/infra/lambda-backend/project.json` file.

## Configuration

Lambda functions are configured in `lambda.settings.ts`:

```Typescript
export const lambdaSettings = {
  [Lambda.SlackMessage]: {
    projectDir: 'lambdas/slack-message',
    memory: 128,   // mbs
    timeout: 30,   // seconds
    sqs: {         // optional: creates a SQS queue trigger for this lambda function
      fifo: false, // If true, the SQS queue will be created as a FIFO queue
    },
    env: [         // On deploy time, the lambda function will be deployed with these environment variables taken from the deployment environment
      'SLACK_ENDPOINT',
      'SLACK_REDIRECT_MESSAGES_CHANNEL',
    ],
  },
  // ... other Lambda configurations
};
```

CDK will automatically generate the lambda functions, API Gateway endpoints, and SQS queues based on the configuration.

## Supported Environments

- Local
- Dev
- Staging
- Prod

## Type Safety

The library provides type-safe payload handling through the `LambdaPayloadMap` interface:

```Typescript
type LambdaPayloadMap = {
  [Lambda.SlackMessage]: {
    request: SlackMessageRequest;
    response: SlackMessageResponse;
  };
  // ... other Lambda payload types
};
```

## Adding new Lambda functions

In order to add a new lambda function, you need to follow these steps:

1. Define a new Lambda enum value in ./src/lambda.settings.ts, configure the lambda function
2. Implement the lambda function as a standalone Node app in /lambdas/\*, add the new project's path alias in /tsconfig.base.json
3. Add the lambda project in the "dependsOn" section of the `/infra/cdk/project.json` file in order to include the `node_modules` folder when deploying the lambda function
4. (optional) Add the lambda to the lambda dev server by setting the new lambda as an implicit dependency in `/infra/lambda-backend/project.json` in order to include it in the local lambda dev server

Example:

1. Add `Lambda.NewLambda`, `lambdaSettings[NewLambda]` in './src/lambda.settings.ts'
2. Implement the lambda function code in `/src/lambdas/new-lambda/src/index.ts`
   2a. Configure the new lambda's `project.json` to include the `node_modules` folder in the build. This is required to deploy the lambda function successfully in the cdk pipeline.
3. Update `/infra/cdk/project.json` to include the new lambda function as an implicit dependency
4. Include the new lambda in the lambda dev server's implicit dependencies in `/infra/lambda-backend/project.json`
