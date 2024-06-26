import HomePage from '#client/pages/Homepage.jsx';
import SignUpPage from '#client/pages/SignUpPage.jsx';
import LoginPage from '#client/pages/LoginPage.jsx';
import LogoutPage from '#client/pages/LogoutPage.jsx';
import ProfilePage from '#client/pages/ProfilePage.jsx';
import ResetPasswordPage from '#client/pages/ResetPasswordPage.jsx';
import ResetPasswordVerifyCodePage from '#client/pages/ResetPasswordVerifyCodePage.jsx';
import ResetPasswordConfirmPage from '#client/pages/ResetPasswordConfirmPage.jsx';
import PdfGeneratorPage from '#client/pages/PdfGeneratorPage.jsx';
import NotFoundPage from '#client/pages/NotFoundPage.jsx';

const routes = [
  { path: '/', exact: true, Component: HomePage },
  { path: '/signup', Component: SignUpPage },
  { path: '/login', Component: LoginPage },
  { path: '/logout', Component: LogoutPage },
  { path: '/profile/:userId', Component: ProfilePage },
  { path: '/reset-password', Component: ResetPasswordPage },
  { path: '/reset-password-verify-code', Component: ResetPasswordVerifyCodePage },
  { path: '/reset-password-confirm', Component: ResetPasswordConfirmPage },
  { path: '/pdf-generator/:pdfComponentId', Component: PdfGeneratorPage },
  { path: '*', Component: NotFoundPage },
];

export default routes;
