import React, { Suspense } from 'react';
import App from '#client/App.jsx';

const lazy = (fn) => {
  if (process.browser) {
    return React.lazy(fn);
  }
  return Promise.resolve(fn());
}

const HomePage = () => import('#client/pages/Homepage.jsx');
const SignUpPage = () => import('#client/pages/SignUpPage.jsx');
const LoginPage = () => import('#client/pages/LoginPage.jsx');
const LogoutPage = () => import('#client/pages/LogoutPage.jsx');
const ProfilePage = () => import('#client/pages/ProfilePage.jsx');
const ResetPasswordPage = () => import('#client/pages/ResetPasswordPage.jsx');
const ResetPasswordVerifyCodePage = () => import('#client/pages/ResetPasswordVerifyCodePage.jsx');
const ResetPasswordConfirmPage = () => import('#client/pages/ResetPasswordConfirmPage.jsx');
const PdfGeneratorPage = () => import('#client/pages/PdfGeneratorPage.jsx');
const NotFoundPage = () => import('#client/pages/NotFoundPage.jsx');

async function withLazyLoader(componentLoader) {
  console.log('WITH LAZY LOADER', componentLoader);
  const Component = await lazy(componentLoader);
  const routeSettings = { Component };
  if (Component.fetchPageData) {
    routeSettings.loader = fetchPageData;
  }
  return routeSettings;
}

const routes = [
  { path: '/', index: true, exact: true, component: HomePage },
  { path: '/signup', exact: true, component: SignUpPage },
  { path: '/login', component: LoginPage },
  { path: '/logout', component: LogoutPage },
  { path: '/profile/:userId', exact: true, component: ProfilePage },
  { path: '/reset-password', component: ResetPasswordPage },
  { path: '/reset-password-verify-code', component: ResetPasswordVerifyCodePage },
  { path: '/reset-password-confirm', component: ResetPasswordConfirmPage },
  { path: '/pdf-generator/:pdfcomponentId', exact: true, component: PdfGeneratorPage },
  { path: '*', isNotFound: true, component: NotFoundPage },
];

export const router = [
  {
    path: '/',
    element: <App />,
    children: routes.map((route) => {
      const PageComponent = route.component;

      return {
        ...route,
        index: route.path === '/',
        lazy: withLazyLoader(HomePage)
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PageComponent />
          </Suspense>
        ),
      };
    }),
  },
];

export default routes;
