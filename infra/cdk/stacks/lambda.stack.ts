import type { Construct } from 'constructs';
import type { LambdaConfigRecordType } from '@namespace/lambda';
import type { StackProps } from 'aws-cdk-lib';

import { resolve, join } from 'path';
import { Stack, CfnOutput, Duration } from 'aws-cdk-lib';
import {
  Function,
  Code,
  Runtime,
  LayerVersion,
  DockerImageCode,
  DockerImageFunction,
} from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue as SqsQueue } from 'aws-cdk-lib/aws-sqs';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction as LambdaFunctionTarget } from 'aws-cdk-lib/aws-events-targets';

const chromiumLayerAssetName = 'chromium-v130.0.0-layer.zip';
const chromiumLayerPath = resolve(__dirname, '../assets', chromiumLayerAssetName);
const distDir = resolve(__dirname, '../../../../..');

export interface LambdaStackProps extends StackProps {
  environment: string;
  functionName: string;
  lambdaSettings: LambdaConfigRecordType;
  lambdaEnvVars: Record<string, string>;
}

export class LambdaStack extends Stack {
  public readonly lambdaFunction: Function;
  public readonly lambdaFunctionName: string;
  public readonly queueUrl?: string;
  public readonly apiUrl?: string;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const {
      environment,
      functionName,
      lambdaSettings: {
        projectDir,
        memory,
        timeout,
        sqs,
        docker,
        isScraper,
        cron,
        runtime,
        handler,
        retries,
      },
      lambdaEnvVars,
    } = props;

    this.lambdaFunctionName = `${environment}-${functionName}`;

    const layers = [];
    if (isScraper) {
      const chromiumLayer = new LayerVersion(this, `${environment}-ChromiumLayer`, {
        layerVersionName: `${environment}-chromium-layer`,
        code: Code.fromAsset(chromiumLayerPath),
        description: 'Chromium binary for web scraping',
        compatibleRuntimes: [Runtime.NODEJS_20_X],
      });
      layers.push(chromiumLayer);
    }

    // Define the Lambda function
    let lambdaFunction;

    if (docker) {
      const dockerImageAsset = new DockerImageAsset(this, `${this.lambdaFunctionName}DockerImage`, {
        directory: join(distDir, projectDir),
      });

      lambdaFunction = new DockerImageFunction(this, `${this.lambdaFunctionName}LambdaFunction`, {
        functionName: this.lambdaFunctionName,
        code: DockerImageCode.fromEcr(dockerImageAsset.repository, {
          tagOrDigest: dockerImageAsset.imageTag,
          cmd: [handler || 'main.handler'],
        }),
        memorySize: memory,
        environment: lambdaEnvVars,
        timeout: Duration.seconds(timeout || 10),
        retryAttempts: retries || 0,
      });
    } else {
      lambdaFunction = new Function(this, `${this.lambdaFunctionName}LambdaFunction`, {
        functionName: this.lambdaFunctionName,
        code: Code.fromAsset(join(distDir, projectDir)),
        handler: handler || 'main.handler',
        runtime: runtime === 'python' ? Runtime.PYTHON_3_12 : Runtime.NODEJS_20_X,
        memorySize: memory,
        environment: lambdaEnvVars,
        timeout: Duration.seconds(timeout || 10),
        retryAttempts: retries || 0,
        layers,
      });
    }

    lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: ['arn:aws:s3:::*'],
      }),
    );

    lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['sqs:SendMessage'],
        resources: [`arn:aws:sqs:us-east-1:${this.account}:*`],
      }),
    );

    // Add permission to invoke other Lambda functions with environment prefix
    lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['lambda:InvokeFunction', 'lambda:InvokeAsync'],
        resources: [`arn:aws:lambda:${this.region}:${this.account}:function:${environment}-*`],
      }),
    );

    // Set the public lambdaFunctionArn property
    this.lambdaFunction = lambdaFunction;

    // Output the Lambda function ARN
    new CfnOutput(this, 'LambdaFunctionArn', {
      value: this.lambdaFunction.functionArn,
      description: 'The ARN of the Lambda function',
    });

    if (sqs) {
      const { fifo } = sqs;

      // Create SQS Queue
      const lambdaQueueName = `${this.lambdaFunctionName}LambdaEventQueue`;

      const deadLetterQueue = {
        queue: new SqsQueue(this, `${lambdaQueueName}DLQ`, {
          queueName: `${lambdaQueueName}-dlq${fifo ? '.fifo' : ''}`,
          // WARN: There is a bug when setting fifo: false, it breaks on production. Defaulting to `undefined` in the meanwhile.
          fifo: fifo || undefined,
        }),
        maxReceiveCount: 5,
      };
      const queue = new SqsQueue(this, lambdaQueueName, {
        queueName: `${lambdaQueueName}${fifo ? '.fifo' : ''}`,
        fifo: fifo || undefined,
        deadLetterQueue,
      });

      // Add SQS event source to Lambda function
      lambdaFunction.addEventSource(new SqsEventSource(queue));

      // Set public properties
      this.queueUrl = queue.queueUrl;

      // Output the SQS queue URL
      new CfnOutput(this, 'SQSQueueUrl', {
        value: this.queueUrl,
        description: 'The URL of the SQS queue',
      });
    }

    if (cron) {
      // Create EventBridge rule with cron schedule
      const rule = new Rule(this, `${this.lambdaFunctionName}ScheduleRule`, {
        ruleName: `${this.lambdaFunctionName}-schedule`,
        schedule: Schedule.cron(cron),
        description: `Scheduled execution for ${this.lambdaFunctionName}`,
      });

      // Add the Lambda function as a target
      rule.addTarget(new LambdaFunctionTarget(lambdaFunction));
    }
  }
}
