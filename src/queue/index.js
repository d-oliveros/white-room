import queue from './queue.js';

console.log('Loading queue... TODO');

// queue.setMaxListeners(Object.keys(jobs).length);

// lodashEach((job) => {
//   queue.process(job.name, job.concurrency || 1, job.process);
// }, jobs);

export default queue;
