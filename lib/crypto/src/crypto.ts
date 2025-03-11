import { createHash, timingSafeEqual, scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

import { stableStringify } from '@namespace/util';
import { InternalError } from '@namespace/shared';

const scryptAsync = promisify(scrypt);

/**
 * Compares a plain text string against a stored hashed string.
 *
 * @param {string} plainString - The plain text string to validate.
 * @param {string} hashedString - The stored hashed string to compare against.
 * @returns {Promise<boolean>} A promise that resolves to true if the strings match, false otherwise.
 * @throws {InternalError} If an unexpected error occurs during comparison.
 */
export async function compareHashedString(
  plainString: string,
  hashedString: string,
): Promise<boolean> {
  try {
    const [salt, hash] = hashedString.split('$');
    const keyLength = Buffer.from(hash, 'hex').length;
    const derivedKey = (await scryptAsync(plainString, salt, keyLength)) as Buffer;
    return timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
  } catch (error) {
    throw new InternalError(
      'An unexpected error occurred while comparing the hashed string: ' + error,
    );
  }
}

/**
 * Hashes a plain text string using scrypt algorithm.
 *
 * @param {string} plainString - The plain text string to hash.
 * @returns {Promise<string>} A promise that resolves to the hashed string.
 * @throws {InternalError} If an unexpected error occurs during hashing.
 */
export async function hashString(plainString: string): Promise<string> {
  try {
    if (!plainString) {
      throw new Error('Invalid input: plainString is required');
    }
    const salt = randomBytes(16).toString('hex');
    const keyLength = 32; // 256 bits
    const derivedKey = (await scryptAsync(plainString, salt, keyLength)) as Buffer;
    return `${salt}$${derivedKey.toString('hex')}`;
  } catch (error) {
    throw new InternalError('An unexpected error occurred while hashing the string: ' + error);
  }
}

/**
 * Generates a deterministic hash identifier for a JSON-serializable object.
 *
 * This function takes any JSON-serializable object and generates a consistent
 * hash identifier that will be the same for equivalent objects, regardless of
 * property order. It works by:
 *
 * 1. Converting the object to a stable string representation using stableStringify
 * 2. Generating a SHA-256 hash of the normalized string
 *
 * @param jsonObject - Any JSON-serializable object to generate an ID for
 * @returns A hex string hash identifier, or null if input is invalid
 */

export function getObjectId(jsonObject: unknown): string | null {
  if (jsonObject === null || jsonObject === undefined) {
    return null;
  }
  // Convert the object to a deterministically ordered string
  const serializedObject = stableStringify(jsonObject || {}) || '';
  if (!serializedObject) {
    return null;
  }

  // Hash the string to obtain a shorter, fixed-size identifier
  const hash = createHash('sha256').update(serializedObject).digest('hex');

  return hash;
}
