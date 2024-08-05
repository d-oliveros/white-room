import { QueryClient } from '@tanstack/react-query'

const createReactQueryClient = ({ apiClient }) => {
  const requestServiceFn = async ({ queryKey }) => {
    const [path, payload] = queryKey;
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
