export default async function update({ state, apiClient }, userUpdates) {
  await apiClient.postWithState({
    action: '/user/update',
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
