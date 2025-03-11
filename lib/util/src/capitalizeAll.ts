import { capitalize } from './capitalize';

/**
 * Capitalizes the first letter of each word in a string,
 * while preserving the original spaces within the string.
 *
 * @param {string} input - The input string to be capitalized.
 * @returns {string | null} - The string with each word capitalized or null if input is not a string.
 */
export function capitalizeAll(input?: string): string | null {
  if (typeof input !== 'string') {
    return null;
  }
  return input.split(' ').map(capitalize).join(' ');
}
