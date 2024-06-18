/**
 * Extracts a phone number from a formatted phone text string.
 * Supports international codes as well, +52 (818) 561 2114 is extracted as "8185612114".
 *
 * @param  {string} string                      Formatted phone string.
 * @param  {Object} options.strictNumbersLength If `true`, strings with more than 10 digits will return `null`.
 * @return {string|null}                        E164-formatted phone number (10-digit string) or `null`.
 */
export default function extractPhoneFromText(string, { strictNumbersLength } = {}) {
  if (typeof string !== 'string') {
    return null;
  }
  if (strictNumbersLength && string.replace(/[^0-9]/g, '').length !== 10) {
    return null;
  }
  const phone = string.replace(/\D+/g, '').substr(-10);
  return phone.length === 10 ? phone : null;
}
