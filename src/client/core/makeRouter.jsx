import { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Await, Navigate, Outlet, defer, useLoaderData, useAsyncError, useRouteError } from 'react-router-dom';
import { serializeError } from 'serialize-error';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import logger from '#white-room/logger.js';
import isRedirectResponse from '#white-room/util/isRedirectResponse.js';
import { makePrefetchQueryFn } from '#white-room/client/hooks/reactQuery.js';

import App from '#white-room/client/App.jsx';

const makeLoaderFn = ({ fetchPageData, apiClient, queryClient, dispatch, store }) => {
  console.log('Making loaderFn');
  return ({ params }) => {
    console.log('loaderFn called');
    const shouldDefer = !!process.browser;

    let fetchPageDataPromise = fetchPageData({
      apiClient,
      prefetchQuery: makePrefetchQueryFn({ queryClient }),
      store,
      params,
      dispatch,
    });

    if (!fetchPageDataPromise?.then) {
      fetchPageDataPromise = Promise.resolve(fetchPageDataPromise || null);
    }

    fetchPageDataPromise = fetchPageDataPromise.then((result) => {
      return result || null;
    });

    if (shouldDefer) {
      return defer({
        isDeferred: true,
        data: null,
        promise: fetchPageDataPromise,
        error: null,
        dehydratedQueryClientState: null,
      });
    }
    return new Promise((resolve) => {
      fetchPageDataPromise
        .then((pageProps) => {
          console.log('pageProps');
          console.log(pageProps);
          if (isRedirectResponse(pageProps)) {
            resolve(pageProps);
          }
          else {
            resolve({
              isDeferred: false,
              data: pageProps,
              promise: null,
              error: null,
              dehydratedQueryClientState: dehydrate(queryClient),
            });
          }
        })
        .catch((fetchPageDataError) => {
          const error = new Error(
            `fetchPageData Error: ${fetchPageDataError.message}`,
            { cause: fetchPageDataError },
          );

          logger.error(error);

          resolve({
            isDeferred: false,
            data: null,
            promise: null,
            error: serializeError(fetchPageDataError),
            dehydratedQueryClientState: null,
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

FetchDataErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
};

const ErrorPage = () => {
  const error = useRouteError();
  console.log(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
        {error.stack && (
          <pre>
            {error.stack}
          </pre>
        )}
      </p>
    </div>
  );
};

const MinimalLoadingComponent = () => {
  return (
    <h1>Loading...</h1>
  );
};

const LoaderTransitionHandler = ({ LoadingComponent = MinimalLoadingComponent, children }) => {
  const loaderData = useLoaderData();

  console.log('Rendering: LoaderTransitionHandler');
  console.log('loaderData?', !!loaderData);
  console.log(loaderData);

  const childrenWithProps = (props) => {
    if (loaderData?.dehydratedQueryClientState) {
      return (
        <HydrationBoundary state={loaderData.dehydratedQueryClientState}>
          {children(props || {})}
        </HydrationBoundary>
      );
    }
    return children(props || {});
  }

  if (!loaderData?.isDeferred && !loaderData?.error) {
    console.log('Rendering normal component');
    return childrenWithProps(loaderData?.data);
  }

  if (loaderData?.error) {
    return <FetchDataErrorFallback error={loaderData?.error}/>;
  }

  console.log('Rendering Suspense. Promise:', loaderData.promise);

  return (
    <Suspense fallback={<LoadingComponent />}>
      <Await
        resolve={loaderData.promise}
        errorElement={<FetchDataErrorFallback />}
      >
        {(pageProps) => childrenWithProps(pageProps)}
      </Await>
    </Suspense>
  );
};

LoaderTransitionHandler.propTypes = {
  LoadingComponent: PropTypes.func,
  children: PropTypes.func.isRequired,
};

const Layout = ({ PageLayout }) => {
  if (!PageLayout) {
    return <Outlet />;
  }

  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
}

Layout.propTypes = {
  PageLayout: PropTypes.func,
};

const makeRouter = ({ routes, LoadingComponent, queryClient, apiClient, dispatch, store }) => {
  const notFoundRoute = routes.find(({ path }) => path === '*');
  const NotFoundComponent = notFoundRoute?.Component || null;

  const renderRoute = (route) => {
    if (route.children) {
      return {
        path: route.path,
        element: <Layout PageLayout={route.layout} />,
        children: route.children.map(renderRoute),
      };
    }

    const PageComponent = route.Component;

    let routeLoader = null;

    if (PageComponent?.fetchPageData) {
      routeLoader = makeLoaderFn({
        fetchPageData: PageComponent.fetchPageData,
        store,
        queryClient,
        apiClient,
        dispatch,
      });
    }

    const routeEl = (
      <LoaderTransitionHandler LoadingComponent={LoadingComponent}>
        {(pageProps) => {
          console.log('pageProps');
          console.log(pageProps);
          if (isRedirectResponse(pageProps)) {
            if (pageProps.status === 404 || pageProps.statusCode === 404) {
              return (
                <NotFoundComponent />
              );
            }
            const url = pageProps.headers.get('Location');
            return (
              <Navigate to={url} />
            );
          }

          return (
            <PageComponent {...pageProps || {}} />
          );
        }}
      </LoaderTransitionHandler>
    );

    return {
      path: route.path,
      index: route.path === '/',
      loader: routeLoader,
      element: routeEl,
    };
  };

  return [
    {
      path: '/',
      element: <App />,
      errorElement: <ErrorPage />,
      children: routes.map(renderRoute),
    },
  ];
};

export default makeRouter;
