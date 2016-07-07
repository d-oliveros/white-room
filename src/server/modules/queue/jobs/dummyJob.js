const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default {
  concurrency: 3,

  process: async (job, done) => {
    __log.info(`[Queue dummyJob] Job #${job.id} started`);

    await sleep(3000);

    __log.info(`[Queue dummyJob] Job #${job.id} finished`);
    done();
  }
};
