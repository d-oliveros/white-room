/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * Namespace API
 * API interface. Manually create requests to the API using this UI.
 * OpenAPI spec version: 1.0.0
 */
import type { GetUsers200UsersItemCreatedAt } from './getUsers200UsersItemCreatedAt';
import type { GetUsers200UsersItemRolesItem } from './getUsers200UsersItemRolesItem';
import type { GetUsers200UsersItemProfilePictureUrl } from './getUsers200UsersItemProfilePictureUrl';

export type GetUsers200UsersItem = {
  id: string;
  createdAt: GetUsers200UsersItemCreatedAt;
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
  roles: GetUsers200UsersItemRolesItem[];
  profilePictureUrl: GetUsers200UsersItemProfilePictureUrl;
};
