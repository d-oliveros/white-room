import { QueryClient } from '@tanstack/react-query'

const createReactQueryClient = ({ apiClient }) => {
  const requestServiceFn = async ({ queryKey }) => {
    const { path, payload } = queryKey.reduce((memo, part) => {
      const newPath = typeof part === 'string' && part.length > 0
        ? `${memo.path}/${part}`
        : memo.path;

      const newPayload = typeof part === 'object' ? part : null;

      if (newPayload && memo.payload) {
        throw new Error('Multiple payload objects provided in queryKey');
      }

      return {
        path: newPath,
        payload: newPayload || memo.payload,
      };
    }, {
      path: '',
      payload: null,
    });
    const response = await apiClient.post(path, payload);
    return response;
  };

  return new QueryClient({
    defaultOptions: {
      retry: 3,
      retryDelay: 1000,
      queries: {
        queryFn: requestServiceFn,
        staleTime: 60 * 1000,
      },
    },
  });
}

export default createReactQueryClient;
