import React, { Suspense } from 'react';
import { Await, defer, useLoaderData, useAsyncError } from 'react-router-dom';
import { serializeError } from 'serialize-error';

import log from '#client/lib/log.js';
import App from '#client/App.jsx';

import ErrorPage from '#client/pages/ErrorPage.jsx';

const makeLoaderFn = ({ fetchPageData, apiClient, queryClient, store }) => {
  console.log('Making loaderFn');
  return ({ params }) => {
    console.log('loaderFn called');
    const shouldDefer = !!process.browser;

    console.log('shouldDefer');
    console.log(shouldDefer, fetchPageData);

    let fetchPageDataPromise = fetchPageData({
      apiClient,
      queryClient,
      store,
      params,
    });

    if (!fetchPageDataPromise?.then) {
      fetchPageDataPromise = Promise.resolve(fetchPageDataPromise || null);
    }

    if (shouldDefer) {
      return defer({
        isDeferred: true,
        data: null,
        promise: fetchPageDataPromise,
        error: null,
      });
    }
    return new Promise((resolve) => {
      fetchPageDataPromise
        .then((pageProps) => {
          resolve({
            isDeferred: false,
            data: pageProps,
            promise: null,
            error: null,
          });
        })
        .catch((fetchPageDataError) => {
          const error = new Error(
            `fetchPageData Error: ${fetchPageDataError.message}`,
            { cause: fetchPageDataError },
          );

          log.error(error);

          resolve({
            isDeferred: false,
            data: null,
            promise: null,
            error: serializeError(fetchPageDataError),
          })
        });
    });
  };
}

const FetchDataErrorFallback = ({ error }) => {
  const asyncError = useAsyncError();
  error = error || asyncError;
  console.log({ error, asyncError });

  return (
    <div>
      Failed to load 😬
      <pre>
        {error?.stack}
      </pre>
    </div>
  );
};

const LoadingElement = () => {
  return (
    <h1>Loading...</h1>
  );
};

const LoaderTransitionHandler = ({ children }) => {
  const loaderData = useLoaderData();

  console.log('Rendering: LoaderTransitionHandler');
  console.log('loaderData?', !!loaderData);
  console.log(loaderData);

  if (!loaderData?.isDeferred && !loaderData?.error) {
    console.log('Rendering normal component');
    return children(loaderData?.data || {});
  }

  if (loaderData?.error) {
    return <FetchDataErrorFallback error={loaderData?.error}/>;
  }

  console.log('Rendering Suspense. Promise:', loaderData.promise);

  return (
    <Suspense fallback={<LoadingElement />}>
      <Await
        resolve={loaderData.promise}
        errorElement={<FetchDataErrorFallback />}
        children={(pageProps) => {
          console.log('Rendering children', pageProps);
          return children(pageProps || {});
        }}
      />
    </Suspense>
  );
};

const makeRouter = ({ routes, queryClient, apiClient, store }) => [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: routes.map((route) => {
      const PageComponent = route.Component;
      let routeLoader = null;

      if (PageComponent.fetchPageData) {
        routeLoader = makeLoaderFn({
          fetchPageData: PageComponent.fetchPageData,
          store,
          queryClient,
          apiClient,
        });
      }

      return {
        path: route.path,
        index: route.path === '/',
        loader: routeLoader,
        element: (
          <LoaderTransitionHandler>
            {(pageProps) => (
              <PageComponent {...pageProps || {}} />
            )}
          </LoaderTransitionHandler>
        ),
      };
    }),
  },
];

export default makeRouter;
