import { DataTable } from '../dataTable.class';
import { DataTableId } from '../dataTable.enums';
import { UserSummarySchema } from '@domain/user/user.schemas';

export class UsersDataTable extends DataTable<typeof UserSummarySchema> {
  static readonly id = DataTableId.Users;
  readonly schema = UserSummarySchema;

  query() {
    return this.createQueryBuilder()
      .select([
        'id',
        '"createdAt"',
        '"firstName"',
        '"lastName"',
        'phone',
        'email',
        '(roles::text[]) as roles',
        '"profilePictureUrl"',
      ])
      .from('users', 'u');
  }
}
