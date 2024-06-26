import typeCheck from '#common/util/typeCheck.js';
import { summaryFieldgroup } from '#models/User/fieldgroups.js';
import {
  API_ACTION_USER_GET_BY_ID,
} from '#api/actionTypes.js';

export default async function getById({ state, apiClient }, { userId, refresh }) {
  typeCheck('userId::PositiveNumber', userId);

  const statePath = ['users', 'byId', userId];
  if (state.get(statePath) && !refresh) {
    return state.get(statePath);
  }

  await apiClient.postWithState({
    action: API_ACTION_USER_GET_BY_ID,
    state: state,
    payload: {
      userId,
      fieldgroup: summaryFieldgroup,
    },
    onSuccess(user) {
      if (user) {
        state.set(statePath, user);
        return user;
      }
    },
  });
}
