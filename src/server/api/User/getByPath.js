import { User } from '../../models';

export default async function getByPath(userPath) {
  return await User
    .findOne({ path: userPath })
    .select(User.fieldgroups.profile)
    .lean();
}
