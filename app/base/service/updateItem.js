import typeCheck from '#white-room/util/typeCheck.js';
import knex from '#white-room/server/db/knex.js';

import {
  ROLE_ADMIN,
} from '#user/constants/roles.js';

export default {
  roles: [
    ROLE_ADMIN,
  ],
  validate({ table, where, whereIn, updates }) {
    typeCheck('table::NonEmptyString', table);
    typeCheck('updates::NonEmptyObject', updates);
    if (whereIn) {
      typeCheck('whereIn::NonEmptyArray', whereIn);
    }
    else {
      typeCheck('where::NonEmptyObject', where);
    }
  },
  handler({ payload: { table, updates, where, whereIn } }) {
    const queryChain = knex(table).update(updates);

    if (whereIn) {
      queryChain.whereIn(...whereIn);
    }
    else {
      queryChain.where(where);
    }

    return queryChain;
  },
};
