import type { LambdaConfigRecordType } from './lambda.enums';
import { Lambda } from './lambda.enums';

export const lambdaSettings: Record<Lambda, LambdaConfigRecordType> = {
  [Lambda.SlackMessage]: {
    projectDir: 'lambdas/slack-message',
    memory: 128,
    env: ['SLACK_ENDPOINT', 'SLACK_REDIRECT_MESSAGES_CHANNEL'],
    sqs: {
      fifo: false,
    },
  },
  [Lambda.PdfGenerator]: {
    projectDir: 'lambdas/scrapers/pdf-generator',
    memory: 3000,
    timeout: 300,
    isScraper: true,
    retries: 1,
  },
};
