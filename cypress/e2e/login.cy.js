describe('Login', () => {
  before(() => {
    cy.execSafe('npm run reset-db');
  });

  it('should be able to log in', () => {
    cy.visit('/login');

    // Login
    cy.getFormField('email', 'email')
      .type('1111111111')
      .blur();

    cy.getFormField('password', 'password')
      .type('1111111111')
      .blur();

    cy.get('button')
      .contains('log in')
      .click();

    cy.url()
      .should('include', '/');
  });
});
