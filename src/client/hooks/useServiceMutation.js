import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import useApiClient from '#white-room/client/hooks/useApiClient.js';

const useServiceMutation = (options = {}) => {
  const path = options.serviceId;
  const apiClient = useApiClient();

  const mutationFn = useCallback(async (payload) => {
    const response = await apiClient.post(path, payload);
    return response;
  }, [apiClient, path]);

  return useMutation({
    mutationKey: [path],
    ...options,
    mutationFn,
  });
}

export default useServiceMutation;
