import typeCheck from '#whiteroom/util/typeCheck.js';
import { summaryFieldgroup } from '#user/model/userModel.js';

export default async function getById({ state, apiClient }, { userId, refresh }) {
  typeCheck('userId::PositiveNumber', userId);

  const statePath = ['users', 'byId', userId];
  if (state.get(statePath) && !refresh) {
    return state.get(statePath);
  }

  const user = await apiClient.postWithState({
    action: 'user.getById',
    state: state,
    payload: {
      userId,
      fieldgroup: summaryFieldgroup,
    },
  });

  if (user) {
    state.set(statePath, user);
    return user;
  }
}
