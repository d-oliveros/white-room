import { MailChimpAPI } from 'mailchimp';

const mailchimpKey = __config.mail.mailchimpKey;
let mailchimp;

if (mailchimpKey) {
  try {
    mailchimp = new MailChimpAPI(mailchimpKey, { version : '2.0' });
  } catch (error) {
    __log.error(`Error in mailer: ${error.message}`);
    mailchimp = error;
  }
}

export default mailchimp;
