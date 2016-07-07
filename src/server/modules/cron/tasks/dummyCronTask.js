const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function dummyCronTask() {
  __log.info('[dummyCronTask] Doing nothing...');

  await sleep(4500);

  __log.info('[dummyCronTask] Finished!');

  return 'Yep, finished...';
}
