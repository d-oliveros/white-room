import kue from 'kue';
import { each } from 'lodash';
import jobs from './jobs';

const debug = __log.debug('queue');

const queue = kue.createQueue({
  prefix: 'q',
  redis: __config.database.redis
});

each(jobs, (job, jobName) => {
  queue.process(jobName, jobs.concurrency || 1, job.process);
});

queue.on('job enqueue', (id, type) => {
  debug(`Job #${id} got queued of type ${type}`);
});

export default queue;
