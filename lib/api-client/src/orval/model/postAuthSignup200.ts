/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * Namespace API
 * API interface. Manually create requests to the API using this UI.
 * OpenAPI spec version: 1.0.0
 */
import type { PostAuthSignup200CreatedAt } from './postAuthSignup200CreatedAt';
import type { PostAuthSignup200RolesItem } from './postAuthSignup200RolesItem';
import type { PostAuthSignup200ProfilePictureUrl } from './postAuthSignup200ProfilePictureUrl';

export type PostAuthSignup200 = {
  id: string;
  createdAt: PostAuthSignup200CreatedAt;
  /** @minLength 1 */
  firstName: string;
  /** @minLength 1 */
  lastName: string;
  /**
   * @minLength 10
   * @maxLength 10
   * @pattern ^\d{10}$
   */
  phone: string;
  email: string;
  /** @minItems 1 */
  roles: PostAuthSignup200RolesItem[];
  profilePictureUrl: PostAuthSignup200ProfilePictureUrl;
};
