export default async function update({ state, apiClient }, userUpdates) {
  const userUpdated = await apiClient.postWithState({
    action: '/user/update',
    state: state,
    payload: {
      userUpdates,
    },
  });
  state.set(['currentUser'], {
    ...state.get(['currentUser']),
    ...userUpdated,
  });
}
