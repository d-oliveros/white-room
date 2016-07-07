
module.exports = {
  pygmy: process.env.PYGMY_HOST || null,
  intercom: process.env.INTERCOM_KEY || null,
  slack: {
    endpoint: process.env.SLACK_ENDPOINT || null,
    channel: process.env.SLACK_CHANNEL || '#the-castle'
  }
};
