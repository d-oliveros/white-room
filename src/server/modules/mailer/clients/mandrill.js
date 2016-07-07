import { MandrillAPI } from 'mailchimp';

const mandrillKey = __config.mail.mandrillKey;
let mandrill;

if (mandrillKey) {
  try {
    mandrill = new MandrillAPI(mandrillKey);
  } catch (error) {
    __log.error('Error in mailer: ' + error.message);
    mandrill = error;
  }
}

export default mandrill;
