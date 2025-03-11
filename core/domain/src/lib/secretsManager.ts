import { createLogger } from '@namespace/logger';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const logger = createLogger('secretsManager');

type DatabaseSecret = {
  password: string;
};

const client = new SecretsManagerClient();
let cachedSecret: DatabaseSecret | null = null;

export async function getDatabasePassword(dbSecretArn: string): Promise<string | undefined> {
  if (cachedSecret) {
    return cachedSecret.password;
  }

  const command = new GetSecretValueCommand({
    SecretId: dbSecretArn,
  });

  try {
    const data = await client.send(command);
    const parsedSecret: DatabaseSecret = JSON.parse(data.SecretString || '{}');
    if (typeof parsedSecret?.password !== 'string' || parsedSecret.password.trim() === '') {
      throw new Error('Invalid database password: Password must be a non-empty string');
    }
    cachedSecret = parsedSecret;
  } catch (error: unknown) {
    logger.error(error, 'Error retrieving secret');
    throw error;
  }

  return cachedSecret.password;
}
