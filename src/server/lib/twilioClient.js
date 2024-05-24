import Twilio from 'twilio';
import typeCheck from 'common/util/typeCheck';
import ToE164Phone from 'common/util/ToE164Phone';
import extractPhoneFromText from 'common/util/extractPhoneFromText';

const {
  TWILIO_ACCOUNT_ID,
  TWILIO_AUTH_TOKEN,
  FRONT_OVERRIDE_PHONE,
} = process.env;

const twilioClient = TWILIO_ACCOUNT_ID && TWILIO_AUTH_TOKEN
  ? new Twilio(TWILIO_ACCOUNT_ID, TWILIO_AUTH_TOKEN)
  : null;

const debug = __log.debug('twilioClient');

export async function sendTwilioText({ sender, phone, message, mediaUrl }) {
  typeCheck('phone::Phone', phone);
  typeCheck('sender::Maybe Phone', sender);
  typeCheck('mediaUrl::Maybe String', mediaUrl);

  const formattedPhone = ToE164Phone(FRONT_OVERRIDE_PHONE || extractPhoneFromText(phone));
  const formattedFromPhone = ToE164Phone(sender || '5127143550');
  let smsMessage = message;

  if (FRONT_OVERRIDE_PHONE) {
    smsMessage = `Recipient: ${formattedPhone} - ${message}`;
  }

  debug('Sending Twilio SMS message.', {
    smsMessage,
    from: formattedFromPhone,
    phone: formattedPhone,
  });

  if (!twilioClient) {
    debug('Twilio is not enabled, aborting.');
    return false;
  }

  try {
    const twilioResponse = await twilioClient.messages.create({
      body: message,
      to: formattedPhone,
      from: formattedFromPhone,
      mediaUrl: mediaUrl,
    });
    return twilioResponse;
  }
  catch (error) {
    __log.error(error);
    return false;
  }
}
