describe('Signup', () => {
  before(() => {
    cy.execSafe('npm run reset-db');
  });

  it('should be able to sign up', () => {
    cy.visit('/signup');

    // Signup
    cy.getFormField('firstName', 'short_text')
      .type('Test');

    cy.getFormField('lastName', 'short_text')
      .type('User');

    cy.getFormField('email', 'email')
      .type('testuser@yopmail.com');

    cy.getFormField('password', 'password')
      .type('12345');

    cy.getFormField('confirmPassword', 'password')
      .type('12345');

    cy.get('button')
      .contains('Sign up')
      .click();

    cy.url()
      .should('include', '/');
  });
});
