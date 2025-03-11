import { StrictMode, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';

const { NODE_ENV = 'development', CORE_API_URL = 'http://localhost:3000' } = process.env;

axios.defaults.baseURL = CORE_API_URL;
axios.defaults.withCredentials = true;

// Add response interceptor
axios.interceptors.response.use(
  (response) => {
    // Unwrap the API response structure
    if (response?.data?.success && response?.data?.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 2000,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (typeof mutation.meta?.resetQueries === 'boolean') {
        queryClient.resetQueries();
      } else if (Array.isArray(mutation.meta?.resetQueries)) {
        mutation.meta.resetQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
    },
  }),
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const DevToolsProvider = () => {
  const [ReactQueryDevtools, setReactQueryDevtools] = useState<
    (typeof import('@tanstack/react-query-devtools'))['ReactQueryDevtools'] | null
  >(null);

  useEffect(() => {
    if (NODE_ENV === 'development') {
      import('@tanstack/react-query-devtools')
        .then(({ ReactQueryDevtools }) => {
          setReactQueryDevtools(() => ReactQueryDevtools);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.debug('React Query Devtools loading failed:', error);
        });
    }
  }, []);

  return ReactQueryDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null;
};

root.render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <DevToolsProvider />
        <RouterProvider router={createBrowserRouter(routes)} />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
