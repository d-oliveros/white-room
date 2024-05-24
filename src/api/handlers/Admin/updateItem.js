import typeCheck from 'common/util/typeCheck';

import {
  USER_ROLE_ADMIN,
} from 'common/userRoles';

import {
  API_ACTION_ADMIN_UPDATE_ITEM,
} from 'api/actionTypes';

import knex from 'server/db/knex';

export default {
  type: API_ACTION_ADMIN_UPDATE_ITEM,
  roles: [
    USER_ROLE_ADMIN,
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
