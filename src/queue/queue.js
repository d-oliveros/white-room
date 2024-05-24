import kue from 'kue';
import { promisify } from 'util';
import { serializeError } from 'serialize-error';
import ms from 'ms';

import typeCheck from 'common/util/typeCheck';

const KUE_DEFAULT_TTL_MS = 259200000; // 3 days in ms.

const debug = __log.debug('queue');
const { QUEUE_DELETE_JOBS } = process.env;

debug(`Kue job auto-delete set to: ${QUEUE_DELETE_JOBS === 'true'}`);

const queue = kue.createQueue({
  prefix: 'q',
  redis: __config.database.redis,
});

queue.watchStuckJobs(ms('5m'));

queue.on('job enqueue', (id, type) => {
  debug(`Job #${id} got queued of type ${type}`);
});

queue.on('job start', (id) => {
  debug(`Job #${id} started being processed`);
});

queue.on('job promotion', (id) => {
  debug(`Job #${id} is being promoted from delayed state to queued`);
});

queue.on('job failed attempt', (id, doneAttempts) => {
  debug(`Job #${id} failed. Done attempts: ${doneAttempts}`);
});

queue.on('job remove', (id) => {
  debug(`Job #${id} sucessfully removed.`);
});

queue.on(('job error'), (id) => {
  kue.Job.get(id, (kueJobGetError, job) => {
    if (kueJobGetError) {
      // Return since there is no job to log.
      return;
    }
    const error = new Error(`Job #${id} had errors`);
    error.name = 'QueueJobError';
    error.details = {
      queueError: true,
      jobId: id,
      jobData: job.data,
    };
    __log.info(error);
  });
});

// Job failed and has no remaining attempts.
queue.on('job failed', (id, kueJobError) => {
  kue.Job.get(id, (kueJobGetError, job) => {
    // Kue failed to get the job
    if (kueJobGetError) {
      // Return since there is no job to delete.
      return;
    }

    const error = new Error(`Job #${id} failed: ${kueJobError}`);
    error.name = 'QueueJobFailed';
    error.inner = serializeError(kueJobError);
    error.details = {
      queueError: true,
      jobId: id,
      jobType: job.type,
      jobData: job.data,
    };

    __log.info(error);

    if (QUEUE_DELETE_JOBS === 'true') {
      // Job deletion
      job.remove((kueRemoveError) => {
        // Kue failed to remove error
        if (kueRemoveError) {
          const error = new Error(`Job #${id} failed and could not be deleted: ${kueRemoveError}`);
          error.name = 'QueueJobFailedNotRemoved';
          error.inner = serializeError(kueRemoveError);
          error.details = {
            queueError: true,
            jobId: id,
          };

          __log.info(error);
          return;
        }

        debug(`Successfully removed failed job ${id} `);
      });
    }
  });
});

queue.getItemsByStateAsync = async (state, count) => {
  typeCheck('state::NonEmptyString', state);
  const rangeByStateAsync = promisify(kue.Job.rangeByState.bind(queue.Job));
  const jobs = await rangeByStateAsync(state, 0, count || 500000, 'asc');
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

    let queueCreateChain = queue.create(type, data);
    if (attempts > 0) {
      queueCreateChain = queueCreateChain.attempts(attempts);
    }
    if (delay) {
      queueCreateChain = queueCreateChain.delay(delay);
    }
    if (backoff) {
      queueCreateChain = queueCreateChain.backoff(attempts);
    }

    queueCreateChain = queueCreateChain.removeOnComplete(QUEUE_DELETE_JOBS === 'true');
    queueCreateChain = queueCreateChain.ttl(delay + KUE_DEFAULT_TTL_MS);

    const job = queueCreateChain.save((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(job);
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

  // Get pending jobs.
  const rangeByTypeAsync = promisify(kue.Job.rangeByType.bind(queue.Job));

  const [inactiveJobs, delayedJobs] = await Promise.all([
    rangeByTypeAsync(jobType, 'inactive', 0, 1000000, 'asc'),
    rangeByTypeAsync(jobType, 'delayed', 0, 1000000, 'asc'),
  ]);
  const allJobs = [
    ...inactiveJobs,
    ...delayedJobs,
  ];
  typeCheck('allJobs::Array', allJobs);
  const jobs = params.filter ? allJobs.filter(params.filter) : allJobs;

  // Delete the jobs.
  if (jobs.length > 0) {
    await Promise.all(jobs.map((job) => promisify(job.remove.bind(job))()));
    debug(`Deleted "${jobType}" jobs: ${jobs.length}`);
  }

  return jobs;
};

export default queue;
