var env = process.env;

/**
 * Set the cron intervals for the cron tasks.
 * To disable a task, just comment the line out.
 *
 * @warn
 *  The servers are configured in UTC.
 *  Please, make sure to set the time in the cron pattern correctly.
 */
module.exports = {
  dummyCronTask: '0 */15 * * * *'
};

if (env.ENABLE_CRON !== 'true') {
  console.log('Cron disabled.');
  module.exports = {};
}
