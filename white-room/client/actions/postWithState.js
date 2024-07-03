export default function postWithState(
  { state, apiClient },
  { action, queryId, payload, timeout, onError, onSuccess }
) {
  return apiClient.postWithState({
    action: action,
    queryId: queryId,
    state: state,
    payload: payload,
    timeout: timeout,
    onError: onError,
    onSuccess: onSuccess,
  });
}
