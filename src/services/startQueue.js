import { Worker } from 'bullmq';
import logger from '#white-room/logger.js';
import redisClient from '#white-room/server/db/redis.js';

/**
 * Extracts queue handlers from the provided modules.
 * @param {Object} modules - The modules to extract handlers from.
 * @returns {Array} An array of queue handlers.
 */
export const getQueueHandlersFromModules = (modules) => {
  const queueHandlers = [];

  // Collect all queue handlers from the modules
  for (const moduleName of Object.keys(modules)) {
    const module = modules[moduleName];
    for (const service of module.service) {
      queueHandlers.push({
        event: service.id,
        handler: service.handler,
      });
    }
  }

  return queueHandlers;
};

export const makeProcessServiceJobFn = (queueHandlers) => {
  return async ({ id, name, data }) => {
    console.log({ id, name, data });
    console.log(queueHandlers, name);
    const matches = queueHandlers.filter(({ event }) => event === name);
    if (matches.length > 0) {
      logger.info(`Started queue handler for: ${name}`);
    }
    else {
      const error = new Error(`Handler for event ${name} not found.`);
      error.name = 'QueueProcessJobHandlerNotFound';
      throw error;
    }
    const results = await Promise.allSettled(matches.map((match) => match.handler({ payload: data })));

    const errors = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason);

    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 0) {
      throw AggregateError(errors, 'Queue handler failed.');
    }
  };
}

const startQueue = ({ queueId, queueHandlers }) => {
  const worker = new Worker(queueId, makeProcessServiceJobFn(queueHandlers), {
    connection: redisClient,
    concurrency: 70,
  });

  worker.on('completed', (job) => {
    logger.info(`Job completed: ${job.id}`);
  });

  worker.on('failed', (job, workerError) => {
    const error = new Error(`Job failed: ${job.id}, ${workerError.message}`, { cause: workerError });
    logger.error(error);
  });
}

export default startQueue;
