var env = process.env;

module.exports = {
  mailchimpKey: env.MAILCHIMP_API_KEY || null,
  mandrillKey: env.MANDRILL_API_KEY || null,

  defaultAddress: 'hello@whiteroom.com',
  defaultName: 'White Room',

  redirectEmailsTo: env.REDIRECT_EMAILS_TO || null
};
