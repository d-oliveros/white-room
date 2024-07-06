import typeCheck from '#white-room/util/typeCheck.js';
import { summaryFieldgroup } from '#user/model/user.js';

export default async function getById({ state, apiClient }, { userId, refresh }) {
  typeCheck('userId::PositiveNumber', userId);

  const statePath = ['users', 'byId', userId];
  if (state.get(statePath) && !refresh) {
    return state.get(statePath);
  }

  await apiClient.postWithState({
    action: 'user.getById',
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
