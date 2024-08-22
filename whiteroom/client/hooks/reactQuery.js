import { useCallback } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '#whiteroom/client/hooks/useApiClient.js';

const getQueryKeyFromServiceOptions = (options = {}) => {
  const payload = typeof options.payload === 'object' && Object.keys(options.payload || {}).length > 0
    ? options.payload
    : null;

  return [...options.serviceId.split('/'), payload].filter(Boolean);
}

const normalizeInvalidateOnSuccessValue = (invalidateOnSuccess) => {
  return typeof invalidateOnSuccess === 'string'
    ? [{ serviceId: invalidateOnSuccess }]
    : Array.isArray(invalidateOnSuccess)
      ? invalidateOnSuccess
      : invalidateOnSuccess && typeof invalidateOnSuccess === 'object'
        ? [invalidateOnSuccess]
        : null;
}

export const makePrefetchQueryFn = ({ queryClient }) => {
  return async (serviceOptions) => {
    return queryClient.prefetchQuery({
      queryKey: getQueryKeyFromServiceOptions(serviceOptions),
      ...serviceOptions,
    });
  }
};

export const useServiceQuery = (options = {}) => {
  return useQuery({
    ...options,
    queryKey: getQueryKeyFromServiceOptions(options),
  });
}

export const useServiceMutation = (options = {}) => {
  const path = options.serviceId;
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const mutationFn = useCallback(async (payload) => {
    const response = await apiClient.post(path, payload);
    return response;
  }, [apiClient, path]);

  const onSuccess = (...args) => {
    const invalidateOnSuccess = normalizeInvalidateOnSuccessValue(options.invalidateOnSuccess);
    for (const invalidateQueryRow of invalidateOnSuccess || []) {
      queryClient.invalidateQueries({
        queryKey: getQueryKeyFromServiceOptions(invalidateQueryRow),
      });
    }

    if (options.onSuccess) {
      return options.onSuccess(...args);
    }
    return null;
  };

  return useMutation({
    mutationKey: [path],
    ...options,
    mutationFn,
    onSuccess,
  });
}
