
module.exports = {
  mailchimpKey: process.env.MAILCHIMP_API_KEY || null,
  mandrillKey: process.env.MANDRILL_API_KEY || null,

  defaultAddress: 'hello@boilerplate.com',
  defaultName: 'Boilerplate',

  redirectEmailsTo: process.env.REDIRECT_EMAILS_TO || null
};
