export enum Lambda {
  SlackMessage = 'SlackMessage',
  PdfGenerator = 'PdfGenerator',
}

export type LambdaRuntime = 'nodejs' | 'python';

export enum Environment {
  Local = 'local',
  Dev = 'dev',
  Staging = 'staging',
  Prod = 'prod',
}

export type LambdaConfigRecordType = {
  projectDir: string;
  memory: number;
  timeout?: number;
  retries?: number;
  sqs?: {
    fifo: boolean;
  };
  env?: string[];
  docker?: boolean;
  isScraper?: boolean;
  proxy?: boolean;
  cron?: {
    minute?: string;
    hour?: string;
    day?: string;
    month?: string;
    year?: string;
    weekDay?: string;
  };
  runtime?: LambdaRuntime;
  handler?: string;
};

export type SQSRecordType = {
  fifo: boolean;
};
