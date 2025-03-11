import type { LambdaConfigRecordType } from '@namespace/lambda';

import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { lambdaSettings } from '@namespace/lambda';
import { VpcStack } from '../stacks/vpc.stack';
import { FrontendStack } from '../stacks/frontend.stack';
import { ApiStack } from '../stacks/api.stack';
import { LambdaStack } from '../stacks/lambda.stack';

const distDir = path.resolve(__dirname, '../../../../../../dist');

export function processCdkApp(app: cdk.App, env = {} as Record<string, string>) {
  const environment = env.ENVIRONMENT;
  const appId = env.APP_ID;
  const apiDomainName =
    environment === 'prod' ? `api.${appId}.com` : `api-${environment}.${appId}.com`;
  const frontendDomainName =
    environment === 'prod' ? `${appId}.com` : `${environment}.${appId}.com`;
  const apiProjectDir = '/core/api';
  const webProjectDir = '/core/web';

  const awsEnv = {
    account: env.AWS_ACCOUNT_ID,
    region: env.AWS_REGION,
  };

  // Creates a VPC for this environment
  const vpcStack = new VpcStack(app, `${environment}-VpcStack`, {
    env: awsEnv,
    appId,
    environment,
  });

  // Create and configure all Lambda functions
  const lambdaProjects = Object.entries(lambdaSettings) as Array<[string, LambdaConfigRecordType]>;
  lambdaProjects.forEach(([lambdaFunctionName, lambdaSettings]) => {
    const lambdaStack = new LambdaStack(app, `${environment}-${lambdaFunctionName}Stack`, {
      env: awsEnv,
      environment,
      functionName: lambdaFunctionName,
      lambdaSettings,
      lambdaEnvVars: {
        NODE_ENV: 'production',
        ENVIRONMENT: environment,
        AWS_ACCOUNT_ID: awsEnv.account,
        APP_ID: appId,
        PINO_LEVEL: 'trace',
        PINO_PRETTY: 'false',
        AWS_FILES_BUCKET: vpcStack.filesBucket.bucketName,

        // Add scraper env vars
        ...(lambdaSettings.isScraper
          ? {
              SCRAPER_LAMBDA_ENV: 'true',
              SCRAPER_HEADLESS: 'true',
              SCRAPER_TRACE_RUN: 'false',
              SCRAPER_PROXY: lambdaSettings.proxy ? env.SCRAPER_PROXY : undefined,
            }
          : {}),

        // Process environment variables from array of names
        ...(Array.isArray(lambdaSettings.env)
          ? lambdaSettings.env.reduce(
              (acc, envVarName) => {
                if (env[envVarName]) {
                  acc[envVarName] = env[envVarName];
                }
                return acc;
              },
              {} as Record<string, string>,
            )
          : {}),
      } as Record<string, string>,
    });
    lambdaStack.addDependency(vpcStack);
  });

  // Creates the API Gateway for the core API
  const apiStack = new ApiStack(app, `${environment}-ApiStack`, {
    env: awsEnv,
    domainName: apiDomainName,
    appId,
    environment,
    projectDir: path.join(distDir, apiProjectDir),
    apiEnvVars: ({ dbHost, dbUser, dbName, dbSecretArn }) => ({
      GOOGLE_API_KEY: env.GOOGLE_API_KEY,
      JWT_SECRET_KEY: env.JWT_SECRET_KEY,
      CORE_API_CORS_ORIGIN: `https://${frontendDomainName}`,
      AWS_FILES_BUCKET: `${appId}-${environment}-files`,
      WEB_URL: `https://${frontendDomainName}`,
      AWS_ACCOUNT_ID: env.AWS_ACCOUNT_ID,
      CORE_API_URL: `https://${apiDomainName}`,
      ENVIRONMENT: environment,
      NODE_ENV: 'production',
      APP_ID: appId,
      CORE_DB_HOST: dbHost,
      CORE_DB_PORT: '5432',
      CORE_DB_USER: dbUser,
      CORE_DB_NAME: dbName,
      CORE_DB_SECRET_ARN: dbSecretArn,
      CORE_DB_SYNCHRONIZE: 'false',
      DB_DISABLE_SSL: 'false',
      ORM_LOGGING: 'false',
    }),
    vpc: vpcStack.vpc,
    filesBucket: vpcStack.filesBucket,
  });
  apiStack.addDependency(vpcStack);

  // Creates a CloudFront distribution to serve the frontend
  new FrontendStack(app, `${environment}-FrontendStack`, {
    env: awsEnv,
    domainName: frontendDomainName,
    environment,
    projectDir: path.join(distDir, webProjectDir),
  });
}

function main() {
  const app = new cdk.App();
  const env = process.env as Record<string, string>;
  if (!env.ENVIRONMENT) {
    throw new Error('ENVIRONMENT is not set.');
  }
  if (!['dev', 'staging', 'prod'].includes(env.ENVIRONMENT)) {
    throw new Error(`ENVIRONMENT must be one of dev, staging, prod. Got: ${env.ENVIRONMENT}`);
  }
  processCdkApp(app, env);
  app.synth();
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
