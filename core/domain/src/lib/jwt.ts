import jwt from 'jsonwebtoken';
import { InternalError } from '@namespace/shared';

const { JWT_SECRET_KEY = 'jwt-secret-key' } = process.env;

/**
 * Decodes a JWT token.
 *
 * @param {string} token - The JWT token to decode.
 * @throws {InternalError} If an error occurs while decoding the token.
 * @returns {Promise<T>} The decoded payload of the token.
 */
export async function decodeToken<T>(token: string): Promise<T> {
  try {
    const decodedToken = await new Promise<T>((resolve, reject) => {
      jwt.verify(token, JWT_SECRET_KEY, (error: Error | null, decoded) => {
        if (error) reject(error);
        else resolve(decoded as T);
      });
    });
    return decodedToken;
  } catch (e) {
    throw new InternalError(
      'An unexpected error occurred while decoding the token: ' + (e as Error).message,
    );
  }
}

/**
 * Generates a JWT token from a payload.
 *
 * @param {T} payload - The payload to encode.
 * @returns {Promise<string>} A promise that resolves to the generated token.
 */
export function generateToken<T extends string | object | Buffer>(payload: T): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET_KEY, (error: Error | null, token: string | undefined) => {
      if (error || !token) {
        reject(error || new Error('Token generation failed'));
        return;
      }
      resolve(token);
    });
  });
}
