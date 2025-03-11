import type { RouteObject } from 'react-router-dom';

import Page from '@web/components/layout/Page/Page';
import HomePage from '@web/pages/HomePage';
import NotFoundPage from '@web/pages/NotFoundPage';

import LoginPage from '@web/pages/auth/LoginPage';
import LogoutPage from '@web/pages/auth/LogoutPage';
import SignupPage from '@web/pages/auth/SignupPage';
import AdminDashboardPage from '@web/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@web/pages/admin/AdminUsersPage';

const routes: RouteObject[] = [
  {
    path: '/',
    Component: Page,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/logout', element: <LogoutPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default routes;
