import queue from 'queue';
import typeCheck from 'common/util/typeCheck';

import {
  API_ACTION_ADMIN_CREATE_QUEUE_JOB,
} from 'api/actionTypes';

import {
  USER_ROLE_ADMIN,
} from 'common/userRoles';

export default {
  type: API_ACTION_ADMIN_CREATE_QUEUE_JOB,
  roles: [
    USER_ROLE_ADMIN,
  ],
  validate({ type, data, delay }) {
    typeCheck('type::NonEmptyString', type);
    typeCheck('data::Object', data);
    typeCheck('delay::Maybe PositiveNumber', delay);
  },
  async handler({ payload: { type, data, delay } }) {
    await queue.createAsync({
      type,
      data,
      delay,
    });
  },
};
