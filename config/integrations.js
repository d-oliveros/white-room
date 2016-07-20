var env = process.env;

module.exports = {
  pygmy: env.PYGMY_HOST || null,
  intercom: env.INTERCOM_KEY || null,
  slack: {
    endpoint: env.SLACK_ENDPOINT || null,
    channel: env.SLACK_CHANNEL || '#the-castle'
  }
};
