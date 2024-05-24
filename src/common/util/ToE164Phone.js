/**
 * Formats a phone number to the E.164 standard.
 * https://www.twilio.com/docs/glossary/what-e164
 *
 * Assumes all phones are 10-digit US phone numbers.
 *
 * @param {string} phone Phone number to format to E.164 standards.
 */
export default function ToE164Phone(phone) {
  if (!phone) {
    return '';
  }
  return `+1${phone}`;
}
