import typeCheck from '#whiteroom/util/typeCheck.js';

function makeSignupFormData(signupData) {
  const phone = signupData.phone;

  return {
    user: {
      firstName: signupData.firstName || 'Test',
      lastName: signupData.lastName || 'User',
      password: '1234',
      phone: phone,
      phoneVerified: true,
      signupAnalyticsSessionId: '',
    },
    userAgent: {
      deviceType: 'mobile',
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

Cypress.Commands.add('autocompleteDataTimeInput', (date, inputName) => {
  typeCheck('options::Moment', date);
  return cy.get(`input[name="${inputName}"]`)
    .click()
    .parent()
    .within(() => {
      cy
        .get('.rdtSwitch')
        .click({ force: true })
        .get('.rdtSwitch')
        .click({ force: true })
        .get('td')
        .contains(`${date.format('YYYY')}`)
        .click({ force: true })
        .get('td')
        .contains(`${date.format('MMM')}`)
        .click({ force: true })
        .get('td')
        .not('.rdtOld')
        .contains(`${date.format('D')}`)
        .click({ force: true });
    });
});
