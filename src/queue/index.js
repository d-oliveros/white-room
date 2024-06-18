import lodashEach from 'lodash/fp/each.js';

import jobs from './jobs/index.js';
import queue from './queue.js';

queue.setMaxListeners(Object.keys(jobs).length);

lodashEach((job) => {
  queue.process(job.name, job.concurrency || 1, job.process);
}, jobs);

export default queue;
