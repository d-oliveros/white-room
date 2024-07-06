/**
 * Set the cron intervals for the cron tasks.
 * To disable a task, just comment the line out.
 *
 * @warn
 *  The servers are configured in UTC.
 *  Please, make sure to set the time in the cron pattern correctly.
 */
export default {
  'user.service.health': '*/4 * * * * *', // every 4 seconds
  // 'api.sanityCheck': {
  //   executionInterval: '0 */10 0-3,11-23 * * *', // every 10 minutes from 6 am to 10 pm.
  //   errorSlackChannel: 'bugs',
  //   onlyReportErrors: true,
  //   timeout: 30, // 30s timeout
  // },
};
