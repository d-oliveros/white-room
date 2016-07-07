import mandrill from '../clients/mandrill';
import formatEmailVars from './formatEmailVars';

const debug = __log.debug('mailer:sendMail');

export default async function sendMail(emails, params, vars) {
  const subject = vars.subject || params.subject;
  vars = formatEmailVars(vars);

  if (__config.mail.redirectEmailsTo) {
    debug(`Redirecting emails to: ${ __config.mail.redirectEmailsTo }`);
    emails = [{ email: __config.mail.redirectEmailsTo }];
  }

  if (__config.env === 'test' || process.env.ENABLE_EMAILS !== 'true') {
    debug('Emails disabled: Aborting.');
    return;
  }

  debug(`Sending email through mandrill`);

  return await new Promise((resolve, reject) => mandrill.call(
    'messages',
    'send-template',
    {
      template_name: params.templateName,
      template_content: [],
      message: {
        subject: subject,
        from_email: params.fromAddress || __config.mail.defaultAddress,
        from_name: params.fromName || __config.mail.defaultName,
        to: emails,
        track_opens: true,
        track_clicks: true,
        global_merge_vars: vars || [],
        merge_vars: params.mergeVars || [],
        merge_language: params.mergeLanguage || 'mailchimp'
      }
    }
  , (err) => err ? reject(err) : resolve()));
}
