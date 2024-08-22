import typeCheck from '#whiteroom/util/typeCheck.js';

function makeSignupFormData(signupData) {
  return {
    user: {
      firstName: signupData.firstName || 'Test',
      lastName: signupData.lastName || 'User',
      password: '1234',
      email: signupData.email || 'someone@whiteroom.com',
      phone: signupData.phone || '1235551234',
      signupAnalyticsSessionId: '',
    },
  };
}

Cypress.Commands.add('signup', (signupData = {}) => {
  const signupFormData = makeSignupFormData(signupData);

  Cypress.log({
    name: 'signup',
    message: signupFormData.phone,
  });

  return cy.apiRequest({
    path: '/auth/signup',
    payload: signupFormData,
  });
});

Cypress.Commands.add('login', (phone, password = '1234') => {
  Cypress.log({
    name: 'login',
    message: phone + ' | ' + password,
  });

  return cy.apiRequest({
    path: '/auth/login',
    payload: {
      phone: phone,
      password: password,
    },
  });
});

Cypress.Commands.add('logout', () => {
  Cypress.log({
    name: 'logout',
    message: 'logging out!',
  });

  return cy.apiRequest({
    path: '/auth/logout',
  });
});
