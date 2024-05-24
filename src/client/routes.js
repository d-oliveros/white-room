import pages from 'client/pages';

/* eslint-disable max-len */
const routes = [
  { path: '/', exact: true, component: pages.Home },
  { path: '/signup', exact: true, component: pages.SignUp },
  { path: '/login', component: pages.Login },
  { path: '/logout', component: pages.Logout },
  { path: '/profile/:userId', exact: true, component: pages.ProfilePage },
  { path: '/reset-password', component: pages.ResetPassword },
  { path: '/reset-password-verify-code', component: pages.ResetPasswordVerifyCode },
  { path: '/reset-password-confirm', component: pages.ResetPasswordConfirm },

  { path: '/admin/edit-user', component: pages.AdminUserEditPage },
  { path: '/pdf-generator/:pdfComponentId', exact: true, component: pages.PdfGenerator },

  // The "Not found" route has to be the last route in the array. Routes below this route will not be matched.
  { component: pages.NotFound },
];

export default routes;
