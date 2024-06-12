import pages from '#client/pages/index.js';

/* eslint-disable max-len */
const routes = [
  { path: '/', exact: true, component: pages.HomePage },
  { path: '/signup', exact: true, component: pages.SignUpPage },
  { path: '/login', component: pages.LoginPage },
  { path: '/logout', component: pages.LogoutPage },
  { path: '/profile/:userId', exact: true, component: pages.ProfilePage },
  { path: '/reset-password', component: pages.ResetPasswordPage },
  { path: '/reset-password-verify-code', component: pages.ResetPasswordVerifyCodePage },
  { path: '/reset-password-confirm', component: pages.ResetPasswordConfirmPage },

  // Renders a react component as a PDF file.
  { path: '/pdf-generator/:pdfComponentId', exact: true, component: pages.PdfGeneratorPage },

  // The "Not found" route has to be the last route in the array. Routes below this route will not be matched.
  { component: pages.NotFoundPage },
];

export default routes;
