/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * Namespace API
 * API interface. Manually create requests to the API using this UI.
 * OpenAPI spec version: 1.0.0
 */

export type PostAuthLoginBody = {
  /**
   * @minLength 10
   * @maxLength 10
   * @pattern ^\d{10}$
   */
  phone?: string;
  email?: string;
  /** @minLength 4 */
  password: string;
};
