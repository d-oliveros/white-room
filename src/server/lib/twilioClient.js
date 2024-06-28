import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import ToE164Phone from '#common/util/ToE164Phone.js';
import extractPhoneFromText from '#common/util/extractPhoneFromText.js';

const {
  TWILIO_ACCOUNT_ID,
  TWILIO_AUTH_TOKEN,
  FRONT_OVERRIDE_PHONE,
} = process.env;

const TWILIO_API_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_ID}/Messages.json`;

const debug = logger.createDebug('twilioClient');

// TODO: Test Node.js refactor!
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

  if (!TWILIO_ACCOUNT_ID || !TWILIO_AUTH_TOKEN) {
    debug('Twilio is not enabled, aborting.');
    return false;
  }

  const auth = Buffer.from(`${TWILIO_ACCOUNT_ID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  const body = new URLSearchParams({
    Body: smsMessage,
    To: formattedPhone,
    From: formattedFromPhone,
    ...(mediaUrl && { MediaUrl: mediaUrl }),
  });

  try {
    const response = await fetch(TWILIO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio API error: ${error}`);
    }

    const twilioResponse = await response.json();
    return twilioResponse;
  } catch (error) {
    logger.error(error);
    return false;
  }
}
