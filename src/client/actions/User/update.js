import {
  API_ACTION_USER_UPDATE,
} from '#api/actionTypes';

export default async function update({ state, apiClient }, userUpdates) {
  await apiClient.postWithState({
    action: API_ACTION_USER_UPDATE,
    state: state,
    payload: {
      userUpdates,
    },
    onSuccess(userUpdated) {
      state.set(['currentUser'], {
        ...state.get(['currentUser']),
        ...userUpdated,
      });
      state.set(['search', 'filters'], {
        ...userUpdated.searchFilters,
      });
    },
  });
}
