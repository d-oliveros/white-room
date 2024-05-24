import {
  sendgridIsEnabled,
  SENDGRID_TEMPLATE_TESTING,
  sendMail,
} from 'server/lib/sendgridClient';

const {
  SENDGRID_REDIRECT_EMAILS_TO,
} = process.env;

describe('sendgridClient', function sendgridClientTestSuite() {
  this.timeout(10000);

  describe('sendMail', () => {
    it.skip('should send an email', function sendMailUnitTest() {
      if (!sendgridIsEnabled) {
        console.warn('SendGrid is not enabled. Aborting.'); // eslint-disable-line no-console
        this.skip();
        return;
      }

      if (!SENDGRID_REDIRECT_EMAILS_TO) {
        console.warn('The SendGrid tests can not be run without a SENDGRID_REDIRECT_EMAILS_TO env var set. Aborting.'); // eslint-disable-line no-console,max-len
        this.skip();
        return;
      }

      return sendMail({
        templateId: SENDGRID_TEMPLATE_TESTING,
        values: {},
        recipients: [{
          name: 'Mocha Test',
          email: SENDGRID_REDIRECT_EMAILS_TO,
        }],
      });
    });
  });
});
