import Bull from 'bull';
import { serializeError } from 'serialize-error';
import ms from 'ms';

import dbConfig from '#config/database.js';
import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';

const KUE_DEFAULT_TTL_MS = ms('3d');

const debug = logger.createDebug('queue');
const { QUEUE_DELETE_JOBS } = process.env;

const queue = new Bull('q', {
  redis: dbConfig.redis,
});

queue.on('waiting', (jobId) => {
  debug(`Jobs #${jobId} got queued`);
});

queue.on('active', (job) => {
  debug(`Job #${job.id} started being processed`);
});

queue.on('stalled', (job) => {
  debug(`Job #${job.id} is stalled and will be reprocessed`);
});

queue.on('failed', (job, err) => {
  const error = new Error(`Job #${job.id} failed: ${err}`);
  error.name = 'QueueJobFailed';
  error.inner = serializeError(err);
  error.details = {
    queueError: true,
    jobId: job.id,
    jobType: job.name,
    jobData: job.data,
  };

  logger.info(error);

  if (QUEUE_DELETE_JOBS === 'true') {
    job.remove().then(() => {
      debug(`Successfully removed failed job ${job.id}`);
    }).catch((removeError) => {
      const error = new Error(`Job #${job.id} failed and could not be deleted: ${removeError}`);
      error.name = 'QueueJobFailedNotRemoved';
      error.inner = serializeError(removeError);
      error.details = {
        queueError: true,
        jobId: job.id,
      };

      logger.info(error);
    });
  }
});

queue.on('completed', (job, result) => {
  debug(`Job #${job.id} completed with result ${result}`);
  if (QUEUE_DELETE_JOBS === 'true') {
    job.remove().then(() => {
      debug(`Successfully removed completed job ${job.id}`);
    }).catch((err) => {
      const error = new Error(`Completed job #${job.id} could not be deleted: ${err}`);
      error.name = 'QueueJobCompletedNotRemoved';
      error.inner = serializeError(err);
      error.details = {
        queueError: true,
        jobId: job.id,
      };

      logger.info(error);
    });
  }
});

queue.getItemsByStateAsync = async (state, count) => {
  typeCheck('state::NonEmptyString', state);
  let jobs;
  switch (state) {
    case 'waiting':
      jobs = await queue.getWaiting(count || 500000);
      break;
    case 'active':
      jobs = await queue.getActive(count || 500000);
      break;
    case 'completed':
      jobs = await queue.getCompleted(count || 500000);
      break;
    case 'failed':
      jobs = await queue.getFailed(count || 500000);
      break;
    case 'delayed':
      jobs = await queue.getDelayed(count || 500000);
      break;
    default:
      throw new Error('Invalid state');
  }
  return jobs;
};

queue.createAsync = ({ type, data, delay = 0, backoff, attempts = 0 }) => {
  return new Promise((resolve, reject) => {
    debug('Creating job', {
      type,
      data,
      delay,
      attempts,
      backoff,
    });

    const options = {
      attempts,
      backoff,
      delay,
      removeOnComplete: QUEUE_DELETE_JOBS === 'true',
      ttl: delay + KUE_DEFAULT_TTL_MS,
    };

    queue.add(type, data, options).then((job) => {
      resolve(job);
    }).catch((error) => {
      reject(error);
    });
  });
};

/**
 * Deletes inactive jobs by job type.
 *
 * @param  {string} jobType       Job name constant.
 * @param  {Object} params.filter Filter jobs using this function.
 * @return {Promise}
 */
queue.deleteByType = async (jobType, params = {}) => {
  typeCheck('filter::Maybe Function', params.filter);

  // Get jobs by type.
  const [inactiveJobs, delayedJobs] = await Promise.all([
    queue.getJobs(['waiting', 'paused'], { start: 0, end: 1000000 }),
    queue.getJobs(['delayed'], { start: 0, end: 1000000 }),
  ]);

  const allJobs = [
    ...inactiveJobs.filter(job => job.name === jobType),
    ...delayedJobs.filter(job => job.name === jobType),
  ];
  typeCheck('allJobs::Array', allJobs);
  const jobs = params.filter ? allJobs.filter(params.filter) : allJobs;

  // Delete the jobs.
  if (jobs.length > 0) {
    await Promise.all(jobs.map((job) => job.remove()));
    debug(`Deleted "${jobType}" jobs: ${jobs.length}`);
  }

  return jobs;
};

export default queue;
