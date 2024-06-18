/**
 * Set the cron intervals for the cron tasks.
 * To disable a task, just comment the line out.
 *
 * @warn
 *  The servers are configured in UTC.
 *  Please, make sure to set the time in the cron pattern correctly.
 */
export default {
  test: '*/20 * * * * *',
};
