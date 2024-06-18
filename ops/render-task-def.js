const fs = require('fs');
const path = require('path');
const parseEnvFile = require('./parseEnvFile');

const { env } = process;

const {
  TARGET_ENV,
  DOCKER_TAG,
  COMMIT_HASH,
  AWS_ACCOUNT_ID,
} = env;

const targetEnvToEnvPrefixMapping = {
  development: 'DEV_',
  staging: 'STAGING_',
  production: 'PROD_',
};

const keyPrefix = targetEnvToEnvPrefixMapping[env.TARGET_ENV] || '';

const envFilePath = path.resolve(__dirname, '..', '.env.default');
const envConfig = parseEnvFile(fs.readFileSync(envFilePath));

Object.keys(envConfig).forEach((envPropName) => {
  const envValue = env[keyPrefix + envPropName] || envConfig[envPropName];
  if (envValue) {
    env[envPropName] = envValue;
  }
});

// Set some task definition values based on the target env.
let family;
let memoryReservation;
let cpu;
let memory;
let containerName;

switch (TARGET_ENV) {
  case 'production':
    containerName = 'app';
    family = 'app';
    memoryReservation = 8192;
    cpu = '2048';
    memory = '8192';
    break;

  case 'staging':
    containerName = 'app_staging';
    family = 'app-staging';
    memoryReservation = 2048;
    cpu = '1024';
    memory = '2048';
    break;

  default:
    containerName = 'app_dev';
    family = 'app-dev';
    memoryReservation = 2048;
    cpu = '1024';
    memory = '2048';
    break;
}

// The actual task definition.
const taskDef = {
  containerDefinitions: [
    {
      name: containerName,
      image: DOCKER_TAG,
      cpu: 0,
      memoryReservation: memoryReservation,
      portMappings: [
        {
          containerPort: 3000,
          hostPort: 3000,
          protocol: 'tcp',
        },
      ],
      essential: true,
      environment: [
        ...Object.keys(envConfig).map((envPropName) => ({
          name: envPropName,
          value: env[envPropName],
        })),
        // The commit hash is injected dynamically on deploy.
        { name: 'COMMIT_HASH', value: COMMIT_HASH },
      ],
      mountPoints: [],
      volumesFrom: [],
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          'awslogs-group': '/ecs/' + family,
          'awslogs-region': 'us-east-1',
          'awslogs-stream-prefix': 'ecs',
        },
      },
    },
  ],
  family: family,
  taskRoleArn: `arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole`,
  executionRoleArn: `arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole`,
  networkMode: 'awsvpc',
  volumes: [],
  placementConstraints: [],
  requiresCompatibilities: [
    'FARGATE',
  ],
  cpu: cpu,
  memory: memory,
};

// Stringify it and spit it out to stdout.
console.log(JSON.stringify(taskDef)); // eslint-disable-line no-console
