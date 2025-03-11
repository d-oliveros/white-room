/**
 * Capitalizes the first letter of the first non-space character in a string,
 * while preserving leading and trailing spaces.
 *
 * @param {string} input - The input string to be capitalized.
 * @returns {string | null} - The capitalized string or null if input is not a string.
 */
export function capitalize(input?: string): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  // Capture leading and trailing spaces
  const leadingSpaces = input.match(/^\s*/)?.[0] || '';
  const trailingSpaces = input.match(/\s*$/)?.[0] || '';
  const trimmedInput = input.trim();

  // Capitalize the first letter of the trimmed input and recombine with spaces
  return (
    leadingSpaces + trimmedInput.charAt(0).toUpperCase() + trimmedInput.slice(1) + trailingSpaces
  );
}
