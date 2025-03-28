/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * Namespace API
 * API interface. Manually create requests to the API using this UI.
 * OpenAPI spec version: 1.0.0
 */
import type { PutUsersUserId200UserCreatedAt } from './putUsersUserId200UserCreatedAt';
import type { PutUsersUserId200UserRolesItem } from './putUsersUserId200UserRolesItem';
import type { PutUsersUserId200UserProfilePictureUrl } from './putUsersUserId200UserProfilePictureUrl';

export type PutUsersUserId200User = {
  id: string;
  createdAt: PutUsersUserId200UserCreatedAt;
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
  roles: PutUsersUserId200UserRolesItem[];
  profilePictureUrl: PutUsersUserId200UserProfilePictureUrl;
};
