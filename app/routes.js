import Page from '#ui/view/layout/Page/Page.jsx';
import HomePage from '#ui/view/pages/HomePage.jsx';
import SandboxPage from '#ui/view/pages/SandboxPage.jsx';
import PdfGeneratorPage from '#ui/view/pages/PdfGeneratorPage.jsx';
import NotFoundPage from '#ui/view/pages/NotFoundPage.jsx';

import LoginPage from '#auth/view/pages/LoginPage.jsx';
import LogoutPage from '#auth/view/pages/LogoutPage.jsx';
import SignupPage from '#auth/view/pages/SignupPage.jsx';
import ForgotPasswordPage from '#auth/view/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '#auth/view/pages/ResetPasswordPage.jsx';
import ProfilePage from '#user/view/pages/ProfilePage.jsx';
import AdminDashboardPage from '#admin/view/pages/AdminDashboardPage.jsx';

const routes = [
  {
    path: '/',
    layout: Page,
    children: [
      { path: '/', exact: true, Component: HomePage },
      { path: '/sandbox', exact: true, Component: SandboxPage },
      { path: '/pdf-generator/:pdfComponentId', Component: PdfGeneratorPage },
      { path: '/user/:userId', Component: ProfilePage },
      { path: '/admin', Component: AdminDashboardPage },
    ],
  },
  { path: '/login', exact: true, Component: LoginPage },
  { path: '/logout', exact: true, Component: LogoutPage },
  { path: '/signup', exact: true, Component: SignupPage },
  { path: '/password-forget', exact: true, Component: ForgotPasswordPage },
  { path: '/password-reset', exact: true, Component:  ResetPasswordPage },
  { path: '*', Component: NotFoundPage },
];

export default routes;

